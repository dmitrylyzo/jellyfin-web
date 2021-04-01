import { Events } from 'jellyfin-apiclient';
import toast from '../../../components/toast/toast';
import globalize from '../../../scripts/globalize';
import appSettings from '../../../scripts/settings/appSettings';
import '../../../components/devtools/devtools';

export default function (view, params) {
    function submit(e) {
        appSettings.devtoolsShowLog(view.querySelector('.chkShowLog').checked);
        appSettings.devtoolsLogSize(view.querySelector('.txtDevToolsLogSize').value);

        toast(globalize.translate('SettingsSaved'));

        Events.trigger(view, 'saved');

        if (e) e.preventDefault();

        return false;
    }

    view.addEventListener('viewshow', function () {
        view.querySelector('.userAgent').innerHTML = globalize.translate('DevToolsUserAgent', navigator.userAgent);
        view.querySelector('.platform').innerHTML = globalize.translate('DevToolsPlatform', navigator.platform);
        view.querySelector('.appVersion').innerHTML = globalize.translate('DevToolsAppVersion', navigator.appVersion);

        view.querySelector('.chkShowLog').checked = appSettings.devtoolsShowLog();
        view.querySelector('.txtDevToolsLogSize').value = appSettings.devtoolsLogSize();
        view.querySelector('form').addEventListener('submit', submit);
        view.querySelector('.btnSave').classList.remove('hide');

        import('../../../components/autoFocuser').then(({default: autoFocuser}) => {
            autoFocuser.autoFocus(view);
        });
    });
}
