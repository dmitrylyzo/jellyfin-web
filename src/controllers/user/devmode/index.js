import { Events } from 'jellyfin-apiclient';
import toast from '../../../components/toast/toast';
import globalize from '../../../scripts/globalize';
import appSettings from '../../../scripts/settings/appSettings';

export default function (view, params) {
    function submit(e) {
        appSettings.devmodeShowLog(view.querySelector('.chkShowLog').checked);

        toast(globalize.translate('SettingsSaved'));

        Events.trigger(view, 'saved');

        if (e) e.preventDefault();

        return false;
    }

    view.addEventListener('viewshow', function () {
        view.querySelector('#userAgent').innerHTML = globalize.translate('UserAgent', navigator.userAgent);

        view.querySelector('.chkShowLog').checked = appSettings.devmodeShowLog();
        view.querySelector('form').addEventListener('submit', submit);
        view.querySelector('.btnSave').classList.remove('hide');

        import('../../../components/autoFocuser').then(({default: autoFocuser}) => {
            autoFocuser.autoFocus(view);
        });
    });
}
