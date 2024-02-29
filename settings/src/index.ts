import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

const PLUGIN_ID = '@jupyterlab-examples/settings:settings-example';

const COMMAND_ID = '@jupyterlab-examples/settings:toggle-flag';

/**
 * Initialization data for the settings extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description: 'A JupyterLab minimal example using settings.',
  autoStart: true,
  requires: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settings: ISettingRegistry) => {
    const { commands } = app;
    let limit = 25;
    let flag = false;

    /**
     * Load the settings for this extension
     *
     * @param setting Extension settings
     */
    function loadSetting(setting: ISettingRegistry.ISettings): void {
      // once everything is loaded, read the settings and convert to the correct type
      limit = setting.get('limit').composite as number;
      flag = setting.get('flag').composite as boolean; // must access composite attribute to get value and specify type explicitly
 
      console.log(
        `Settings Example extension: Limit is set to '${limit}' and flag to '${flag}'`
      );

      // console.log(setting.schema.properties);
    }

    // Wait for the application to be restored and
    // for the settings for this plugin to be loaded
    Promise.all([app.restored, settings.load('@jupyterlab/shortcuts-extension:shortcuts')])
    .then(([, settings]) => {
      // read the settings
      let default_shortcuts = settings.schema.properties!.shortcuts.default

      console.log(default_shortcuts)

      // if (default_shortcuts) {
      //   console.log("default shortcuts", default_shortcuts)
      // }

    })
    .catch(reason => {
      console.error(
        `Something went wrong when reading the settings.\n${reason}`
      );
    });

    Promise.all([app.restored, settings.load(PLUGIN_ID)])
      .then(([, setting]) => {
        // read the settings
        loadSetting(setting);

        // console.log('app commands listcommands', app.commands.listCommands().join('\n'));
        // Listen for your plugin setting changes using Signal
        // when signal is emitted, the function loadSettings is called with the new settings
        setting.changed.connect(loadSetting);

        commands.addCommand(COMMAND_ID, {
          label: 'Toggle Flag and Increment Limit',
          isToggled: () => flag,
          execute: () => {
            // Programmatically change a setting
            Promise.all([
              setting.set('flag', !flag), // .set method stores the new value
              setting.set('limit', limit + 1)
            ])
              .then(() => {
                // setting.remove(PLUGIN_ID, key) // trying to figure out key needed
                const newLimit = setting.get('limit').composite as number; // to see if the setting was changed
                const newFlag = setting.get('flag').composite as boolean;
                window.alert(
                  `Settings Example extension: Limit is set to '${newLimit}' and flag to '${newFlag}'`
                );
              })
              .catch(reason => {
                console.error(
                  `Something went wrong when changing the settings.\n${reason}`
                );
              });
          }
        });
      })
      .catch(reason => {
        console.error(
          `Something went wrong when reading the settings.\n${reason}`
        );
      });
  }
};

export default extension;
