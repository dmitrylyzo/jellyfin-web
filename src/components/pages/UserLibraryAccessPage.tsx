import React, { FunctionComponent, useCallback, useEffect, useState, useRef } from 'react';

import loading from '../loading/loading';
import libraryMenu from '../../scripts/libraryMenu';
import globalize from '../../scripts/globalize';
import toast from '../toast/toast';
import { appRouter } from '../appRouter';
import SectionTitleLinkElement from '../dashboard/users/SectionTitleLinkElement';
import SectionTabs from '../dashboard/users/SectionTabs';
import CheckBoxElement from '../dashboard/users/CheckBoxElement';
import CheckBoxListItem from '../dashboard/users/CheckBoxListItem';
import ButtonElement from '../dashboard/users/ButtonElement';

type ItemsArr = {
    Name?: string;
    Id?: string;
    AppName?: string;
    checkedAttribute?: string
}

const UserLibraryAccessPage: FunctionComponent = () => {
    const [ userName, setUserName ] = useState('');
    const [channelsItems, setChannelsItems] = useState<ItemsArr[]>([]);
    const [mediaFoldersItems, setMediaFoldersItems] = useState<ItemsArr[]>([]);
    const [devicesItems, setDevicesItems] = useState<ItemsArr[]>([]);

    const element = useRef<HTMLDivElement>(null);

    const triggerChange = (select) => {
        const evt = document.createEvent('HTMLEvents');
        evt.initEvent('change', false, true);
        select.dispatchEvent(evt);
    };

    const loadMediaFolders = useCallback((user, mediaFolders) => {
        const elem = element.current;

        if (!elem) {
            console.error('Unexpected null reference');
            return;
        }

        const itemsArr: ItemsArr[] = [];

        for (const folder of mediaFolders) {
            const isChecked = user.Policy.EnableAllFolders || user.Policy.EnabledFolders.indexOf(folder.Id) != -1;
            const checkedAttribute = isChecked ? ' checked="checked"' : '';
            itemsArr.push({
                Id: folder.Id,
                Name: folder.Name,
                checkedAttribute: checkedAttribute
            });
        }

        setMediaFoldersItems(itemsArr);

        const chkEnableAllFolders = elem.querySelector('.chkEnableAllFolders') as HTMLInputElement;
        chkEnableAllFolders.checked = user.Policy.EnableAllFolders;
        triggerChange(chkEnableAllFolders);
    }, []);

    const loadChannels = useCallback((user, channels) => {
        const elem = element.current;

        if (!elem) {
            console.error('Unexpected null reference');
            return;
        }

        const itemsArr: ItemsArr[] = [];

        for (const folder of channels) {
            const isChecked = user.Policy.EnableAllChannels || user.Policy.EnabledChannels.indexOf(folder.Id) != -1;
            const checkedAttribute = isChecked ? ' checked="checked"' : '';
            itemsArr.push({
                Id: folder.Id,
                Name: folder.Name,
                checkedAttribute: checkedAttribute
            });
        }

        setChannelsItems(itemsArr);

        if (channels.length) {
            (elem.querySelector('.channelAccessContainer') as HTMLDivElement).classList.remove('hide');
        } else {
            (elem.querySelector('.channelAccessContainer') as HTMLDivElement).classList.add('hide');
        }

        const chkEnableAllChannels = elem.querySelector('.chkEnableAllChannels') as HTMLInputElement;
        chkEnableAllChannels.checked = user.Policy.EnableAllChannels;
        triggerChange(chkEnableAllChannels);
    }, []);

    const loadDevices = useCallback((user, devices) => {
        const elem = element.current;

        if (!elem) {
            console.error('Unexpected null reference');
            return;
        }

        const itemsArr: ItemsArr[] = [];

        for (const device of devices) {
            const isChecked = user.Policy.EnableAllDevices || user.Policy.EnabledDevices.indexOf(device.Id) != -1;
            const checkedAttribute = isChecked ? ' checked="checked"' : '';
            itemsArr.push({
                Id: device.Id,
                Name: device.Name,
                AppName : device.AppName,
                checkedAttribute: checkedAttribute
            });
        }

        setDevicesItems(itemsArr);

        const chkEnableAllDevices = elem.querySelector('.chkEnableAllDevices') as HTMLInputElement;
        chkEnableAllDevices.checked = user.Policy.EnableAllDevices;
        triggerChange(chkEnableAllDevices);

        if (user.Policy.IsAdministrator) {
            (elem.querySelector('.deviceAccessContainer') as HTMLDivElement).classList.add('hide');
        } else {
            (elem.querySelector('.deviceAccessContainer') as HTMLDivElement).classList.remove('hide');
        }
    }, []);

    const loadUser = useCallback((user, mediaFolders, channels, devices) => {
        setUserName(user.Name);
        libraryMenu.setTitle(user.Name);
        loadChannels(user, channels);
        loadMediaFolders(user, mediaFolders);
        loadDevices(user, devices);
        loading.hide();
    }, [loadChannels, loadDevices, loadMediaFolders]);

    const loadData = useCallback(() => {
        loading.show();
        const userId = appRouter.param('userId');
        const promise1 = userId ? window.ApiClient.getUser(userId) : Promise.resolve({ Configuration: {} });
        const promise2 = window.ApiClient.getJSON(window.ApiClient.getUrl('Library/MediaFolders', {
            IsHidden: false
        }));
        const promise3 = window.ApiClient.getJSON(window.ApiClient.getUrl('Channels'));
        const promise4 = window.ApiClient.getJSON(window.ApiClient.getUrl('Devices'));
        Promise.all([promise1, promise2, promise3, promise4]).then(function (responses) {
            loadUser(responses[0], responses[1].Items, responses[2].Items, responses[3].Items);
        });
    }, [loadUser]);

    useEffect(() => {
        const elem = element.current;

        if (!elem) {
            console.error('Unexpected null reference');
            return;
        }

        loadData();

        const onSubmit = (e) => {
            loading.show();
            const userId = appRouter.param('userId');
            window.ApiClient.getUser(userId).then(function (result) {
                saveUser(result);
            });
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        const saveUser = (user) => {
            user.Policy.EnableAllFolders = (elem.querySelector('.chkEnableAllFolders') as HTMLInputElement).checked;
            user.Policy.EnabledFolders = user.Policy.EnableAllFolders ? [] : Array.prototype.filter.call(elem.querySelectorAll('.chkFolder'), function (c) {
                return c.checked;
            }).map(function (c) {
                return c.getAttribute('data-id');
            });
            user.Policy.EnableAllChannels = (elem.querySelector('.chkEnableAllChannels') as HTMLInputElement).checked;
            user.Policy.EnabledChannels = user.Policy.EnableAllChannels ? [] : Array.prototype.filter.call(elem.querySelectorAll('.chkChannel'), function (c) {
                return c.checked;
            }).map(function (c) {
                return c.getAttribute('data-id');
            });
            user.Policy.EnableAllDevices = (elem.querySelector('.chkEnableAllDevices') as HTMLInputElement).checked;
            user.Policy.EnabledDevices = user.Policy.EnableAllDevices ? [] : Array.prototype.filter.call(elem.querySelectorAll('.chkDevice'), function (c) {
                return c.checked;
            }).map(function (c) {
                return c.getAttribute('data-id');
            });
            user.Policy.BlockedChannels = null;
            user.Policy.BlockedMediaFolders = null;
            window.ApiClient.updateUserPolicy(user.Id, user.Policy).then(function () {
                onSaveComplete();
            });
        };

        const onSaveComplete = () => {
            loading.hide();
            toast(globalize.translate('SettingsSaved'));
        };

        (elem.querySelector('.chkEnableAllDevices') as HTMLInputElement).addEventListener('change', function (this: HTMLInputElement) {
            (elem.querySelector('.deviceAccessListContainer') as HTMLDivElement).classList.toggle('hide', this.checked);
        });

        (elem.querySelector('.chkEnableAllChannels') as HTMLInputElement).addEventListener('change', function (this: HTMLInputElement) {
            (elem.querySelector('.channelAccessListContainer') as HTMLDivElement).classList.toggle('hide', this.checked);
        });

        (elem.querySelector('.chkEnableAllFolders') as HTMLInputElement).addEventListener('change', function (this: HTMLInputElement) {
            (elem.querySelector('.folderAccessListContainer') as HTMLDivElement).classList.toggle('hide', this.checked);
        });

        (elem.querySelector('.userLibraryAccessForm') as HTMLFormElement).addEventListener('submit', onSubmit);
    }, [loadData]);

    return (
        <div ref={element}>
            <div className='content-primary'>
                <div className='verticalSection'>
                    <div className='sectionTitleContainer flex align-items-center'>
                        <h2 className='sectionTitle username'>
                            {userName}
                        </h2>
                        <SectionTitleLinkElement
                            className='raised button-alt headerHelpButton'
                            title='Help'
                            url='https://docs.jellyfin.org/general/server/users/'
                        />
                    </div>
                </div>
                <SectionTabs activeTab='userlibraryaccess'/>
                <form className='userLibraryAccessForm'>
                    <div className='folderAccessContainer'>
                        <h2>{globalize.translate('HeaderLibraryAccess')}</h2>
                        <CheckBoxElement
                            labelClassName='checkboxContainer'
                            type='checkbox'
                            className='chkEnableAllFolders'
                            title='OptionEnableAccessToAllLibraries'
                        />
                        <div className='folderAccessListContainer'>
                            <div className='folderAccess'>
                                <h3 className='checkboxListLabel'>
                                    {globalize.translate('HeaderLibraries')}
                                </h3>
                                <div className='checkboxList paperList checkboxList-paperList'>
                                    {mediaFoldersItems.map(Item => {
                                        return (
                                            <CheckBoxListItem
                                                key={Item.Id}
                                                className='chkFolder'
                                                Id={Item.Id}
                                                Name={Item.Name}
                                                checkedAttribute={Item.checkedAttribute}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            <div className='fieldDescription'>
                                {globalize.translate('LibraryAccessHelp')}
                            </div>
                        </div>
                    </div>
                    <div className='channelAccessContainer hide'>
                        <h2>{globalize.translate('HeaderChannelAccess')}</h2>
                        <CheckBoxElement
                            labelClassName='checkboxContainer'
                            type='checkbox'
                            className='chkEnableAllChannels'
                            title='OptionEnableAccessToAllChannels'
                        />
                        <div className='channelAccessListContainer'>
                            <div className='channelAccess'>
                                <h3 className='checkboxListLabel'>
                                    {globalize.translate('Channels')}
                                </h3>
                                <div className='checkboxList paperList' style={{padding: '.5em 1em'}}>
                                    {channelsItems.map(Item => (
                                        <CheckBoxListItem
                                            key={Item.Id}
                                            className='chkChannel'
                                            Id={Item.Id}
                                            Name={Item.Name}
                                            checkedAttribute={Item.checkedAttribute}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className='fieldDescription'>
                                {globalize.translate('ChannelAccessHelp')}
                            </div>
                        </div>
                    </div>
                    <br />
                    <div className='deviceAccessContainer hide'>
                        <h2>{globalize.translate('HeaderDeviceAccess')}</h2>
                        <CheckBoxElement
                            labelClassName='checkboxContainer'
                            type='checkbox'
                            className='chkEnableAllDevices'
                            title='OptionEnableAccessFromAllDevices'
                        />
                        <div className='deviceAccessListContainer'>
                            <div className='deviceAccess'>
                                <h3 className='checkboxListLabel'>
                                    {globalize.translate('HeaderDevices')}
                                </h3>
                                <div className='checkboxList paperList' style={{padding: '.5em 1em'}}>
                                    {devicesItems.map(Item => (
                                        <CheckBoxListItem
                                            key={Item.Id}
                                            className='chkDevice'
                                            Id={Item.Id}
                                            Name={Item.Name}
                                            AppName={Item.AppName}
                                            checkedAttribute={Item.checkedAttribute}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className='fieldDescription'>
                                {globalize.translate('DeviceAccessHelp')}
                            </div>
                        </div>
                        <br />
                    </div>
                    <br />
                    <div>
                        <ButtonElement
                            type='submit'
                            className='raised button-submit block'
                            title='Save'
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserLibraryAccessPage;
