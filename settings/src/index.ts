import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { SettingManager } from '@jupyterlab/services';

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

    const manager = new SettingManager();

    // async function fetch(id: string) {
    //   try {
    //     const result_id = await manager.fetch(id);
    //     console.log("result of manager.fetch", result_id);

    //   } catch (e) {
    //     console.log('an error occurred while fetching', e)
    //   }
    // }

    async function fetch_and_save(id:string, settings: ISettingRegistry.ISettings, manager: SettingManager) {
      try {
        const fetched_settings = await manager.fetch(id);
        console.log("result of manager.fetch before save", fetched_settings);
        console.log("result of settings passed in", settings)

        // const json_setting = JSON.stringify(fetched_settings);
        // console.log(json_setting)
        const test_json = `{"theme": "hi"}`
        // await manager.save(id, test_json);

        // const raw = `{}`;
        await manager.save(id, test_json);
        console.log(JSON.parse((await manager.fetch(id)).raw));
      } catch (e) {
        console.log('an error occurred while fetching', e)
      }
    }

    // fetch('@jupyterlab/shortcuts-extension:shortcuts');

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

    }

    // async function save(id: string, setting: ISettingRegistry.ISettings) {
    //   try {
    //     const json_setting = JSON.stringify(setting)
    //     await manager.save(id, json_setting);
    //     console.log(manager);
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }

    // Wait for the application to be restored and
    // for the settings for this plugin to be loaded
    Promise.all([app.restored, settings.load('@jupyterlab/shortcuts-extension:shortcuts')])
    .then(([, settings]) => {
      // read the settings
      // let default_shortcuts = (settings.schema.properties!.shortcuts.default!);
      let user_shortcuts = (settings.user.shortcuts!);

      // console.log("default shortcuts", default_shortcuts)
      console.log("settings before changing default shortcuts", settings.user);

      // const shortcut_names = Object.values(default_shortcuts);
      const user_shortcuts_names = structuredClone(Object.values(user_shortcuts));

      // shortcut_names[16].disabled = true;
      // shortcut_names[16].keys = [];
      // console.log("shortcut 16", shortcut_names[16]);

      // shortcut_names[17].disabled = true;
      // shortcut_names[17].keys = [];
      // console.log("shortcut 17", shortcut_names[17]);

      // shortcut_names[100].disabled = true;
      // shortcut_names[100].keys = [];
      // console.log("shortcut 100", shortcut_names[100]);

      // shortcut_names[110].disabled = true;
      // shortcut_names[110].keys = [];
      // console.log("shortcut 100", shortcut_names[110]);

      user_shortcuts_names[101].disabled = true;
      user_shortcuts_names[101].keys = [];

      user_shortcuts_names[102].disabled = true;
      user_shortcuts_names[102].keys = [];

      console.log("user shortcuts after change", user_shortcuts_names)
      console.log("settings after change", settings)

      fetch_and_save('@jupyterlab/shortcuts-extension:shortcuts', settings, manager);

    })
    .catch(reason => {
      console.error(
        `Something went wrong when reading the settings.\n${reason}`
      );
    });

    // Promise.all([app.restored, settings.load('@jupyterlab/shortcuts-extension:shortcuts')])
    // .then(([, settings]) => {
    //   // read the settings
      
    //   console.log("settings after change", settings)
    //   //save(PLUGIN_ID, JSON.stringify(settings))
    // })
    // .catch(reason => {
    //   console.error(
    //     `Something went wrong when reading the settings.\n${reason}`
    //   );
    // });

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
