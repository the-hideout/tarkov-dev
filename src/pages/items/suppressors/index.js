import { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiBottleWine } from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import { Filter, ToggleFilter, SelectItemFilter } from '../../../components/filter/index.js';
import SmallItemTable from '../../../components/small-item-table/index.js';

import useItemsData from '../../../features/items/index.js';
import useMetaData from '../../../features/meta/index.js';

function Suppressors() {
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [selectedGun, setSelectedGun] = useState(false);
    const [showOnlySuppressors, setShowOnlySuppressors] = useState(false);
    const { data: items } = useItemsData();
    const { data: meta } = useMetaData();

    const { muzzleAdaptersHandbookId, suppressorsHandbookId } = useMemo(() => {
        const handbookCategories = meta?.handbookCategories ?? [];
        const findId = (normalizedName) =>
            handbookCategories.find((cat) => cat.normalizedName === normalizedName)?.id;

        return {
            muzzleAdaptersHandbookId: findId('muzzle-adapters'),
            suppressorsHandbookId: findId('suppressors'),
        };
    }, [meta]);

    const { t } = useTranslation();

    const handbookCategoryId = meta?.handbookCategories?.find(
        (cat) => cat.normalizedName === (showOnlySuppressors ? 'suppressors' : 'muzzle-devices'),
    )?.id;

    const combineAttachmentStatsFilter = useCallback(
        (formattedItem, rawItem) => {
            if (!rawItem) return false;
            // include items that are in the selected handbook category (suppressors or muzzle-devices)
            if (handbookCategoryId && Array.isArray(rawItem.handbookCategories)) {
                if (rawItem.handbookCategories.some((hc) => hc.id === handbookCategoryId))
                    return true;
            }
            // fallback: include anything explicitly typed as 'suppressor' or 'muzzle-device'
            if (rawItem.types?.includes('suppressor') || rawItem.types?.includes('muzzle-device'))
                return true;
            return false;
        },
        [handbookCategoryId],
    );

    const suppressorsCustomFilter = useCallback(
        (item) => {
            // If toggle is enabled, only include items that are suppressors.
            if (showOnlySuppressors) {
                // Prefer handbook category when available
                if (Array.isArray(item.handbookCategories) && suppressorsHandbookId) {
                    return item.handbookCategories.some((category) => category.id === suppressorsHandbookId);
                }

                // Fallback to type check
                return Array.isArray(item.types) && item.types.includes('suppressor');
            }

            // When not restricted to only suppressors, keep previous behavior:
            // - If no handbook categories or no muzzle adapter handbook id, include the item
            if (!Array.isArray(item.handbookCategories) || !muzzleAdaptersHandbookId) {
                return true;
            }

            const isMuzzleAdapter = item.handbookCategories.some(
                (category) => category.id === muzzleAdaptersHandbookId,
            );

            if (!isMuzzleAdapter) {
                return true;
            }

            if (!suppressorsHandbookId) {
                return false;
            }

            const isAlsoSuppressor = item.handbookCategories.some(
                (category) => category.id === suppressorsHandbookId,
            );

            return isAlsoSuppressor;
        },
        [showOnlySuppressors, muzzleAdaptersHandbookId, suppressorsHandbookId],
    );

    const activeGuns = useMemo(() => {
        return items
            .filter((item) => item.types.includes('gun'))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => {
                let iconLink = item.iconLink;
                if (item.properties?.defaultPreset) {
                    const preset = items.find((i) => i.id === item.properties.defaultPreset.id);
                    if (preset) {
                        iconLink = preset.iconLink;
                    }
                }
                return {
                    ...item,
                    iconLink,
                };
            });
    }, [items]);

    return [
        <SEO
            title={`${t('Barrel Attachments')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t(
                'barrel-attachments-page-description',
                'This page includes a sortable table with information on the different types of barrel attachments available in the game, including their ergonomics, recoil, and cheapest price.',
            )}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    <Icon path={mdiBottleWine} size={1.5} className="icon-with-text" />
                    {t('Barrel Attachments')}
                </h1>
                <Filter center className="barrel-attachments-filter">
                    <ToggleFilter
                        checked={showAllItemSources}
                        label={t('Ignore settings')}
                        onChange={(e) => setShowAllItemSources(!showAllItemSources)}
                        tooltipContent={
                            <>{t('Shows all sources of items regardless of your settings')}</>
                        }
                    />
                    <ToggleFilter
                        checked={showOnlySuppressors}
                        label={t('Only suppressors')}
                        onChange={(value) => setShowOnlySuppressors(value)}
                        tooltipContent={t(
                            'When enabled, show only suppressors; otherwise show all muzzle devices',
                        )}
                    />
                    {/* Attachment details are shown by default now; removed toggle to simplify UX */}
                    <SelectItemFilter
                        label={t('Filter by gun')}
                        placeholder={t('select a gun')}
                        items={activeGuns}
                        onChange={(event) => {
                            if (!event) {
                                return true;
                            }

                            if (!event.value) {
                                setSelectedGun(undefined);
                            }

                            setSelectedGun(
                                activeGuns.find((activeGun) => activeGun.id === event.value),
                            );
                        }}
                        wide
                    />
                </Filter>
            </div>

            <SmallItemTable
                /* choose between the 'suppressors' handbook category or the broader 'muzzle-devices' category based on the toggle */
                handbookCategoryFilter={
                    meta?.handbookCategories?.find(
                        (cat) =>
                            cat.normalizedName ===
                            (showOnlySuppressors ? 'suppressors' : 'muzzle-devices'),
                    )?.id
                }
                showAllSources={showAllItemSources}
                attachesToItemFilter={selectedGun}
                showAttachTo={true}
                ergonomics={1}
                recoilModifier={2}
                cheapestPrice={3}
                combineAttachmentStats={['ergonomics', 'recoilModifier']}
                combineAttachmentStatsFilter={combineAttachmentStatsFilter}
                customFilter={suppressorsCustomFilter}
            />

            <div className="page-wrapper barrel-attachments-page-wrapper">
                <Trans i18nKey={'suppressors-page-p'}>
                    <p>
                        {
                            'In Escape from Tarkov, a barrel attachment is a muzzle device (a functional mod) and can be installed on a weapon.'
                        }
                    </p>
                    <p>
                        {
                            'On this page you can sort them by ergonomics penalty, recoil improvement or their cost and see on which weapon they can be directly mounted.'
                        }
                    </p>
                    <p>
                        {
                            'Ergonomics and recoil columns include the totals from any required threads, muzzle devices, or barrels needed to mount each barrel attachment.'
                        }
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Suppressors;
