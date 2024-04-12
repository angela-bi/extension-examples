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

    async function fetch_and_save(id:string, settings: ISettingRegistry.ISettings, manager: SettingManager, shortcut: any) {
      try {
        const fetched_settings = await manager.fetch(id);
        console.log("result of manager.fetch before save", fetched_settings);
        const raw = fetched_settings.raw
        // console.log("result of raw before save", raw);

        const raw_json = JSON.parse(raw)

        const shift_enter: string[] = ['Shift Enter'];

        for (let i=0; i<raw_json.shortcuts.length; i++) {
          if (raw_json.shortcuts[i].keys === shift_enter) {
            console.log('changing shortcut', raw_json.shortcuts[i])
            raw_json.shortcuts[i].keys = [];
          }
        }

        // for (let shortcut in raw_json.shortcuts) {
        //   console.log(shortcut)
        // }

        // raw_json.shortcuts[15].keys = [];
        // raw_json.shortcuts[14].keys = [];
        // raw_json.shortcuts[84].keys = [];

        //console.log("changed json", raw_json);
        console.log("changed json stringified", JSON.stringify(raw_json));

        //console.log("result of shortcut passed in", shortcut)

        // console.log("result of jsoned settings", json_setting);
        // await manager.save(id, json_setting);

        // const raw = `{}`;
        await manager.save(id, JSON.stringify(raw_json));
        console.log("result of manager.fetch after change", JSON.parse((await manager.fetch(id)).raw));
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
      console.log("settings before changing default shortcuts", settings);

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

      // user_shortcuts_names[15].disabled = true;
      // user_shortcuts_names[15].keys = [];

      // user_shortcuts_names[14].disabled = true;
      // user_shortcuts_names[14].keys = [];

      console.log("user shortcuts after change", user_shortcuts_names)
      // console.log("settings after change", settings)

      fetch_and_save('@jupyterlab/shortcuts-extension:shortcuts', settings, manager, user_shortcuts_names);

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
