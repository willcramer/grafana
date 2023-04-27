import React, { useCallback, useEffect } from 'react';

import { Spinner } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { DashboardViewItem } from 'app/features/search/types';
import { useDispatch } from 'app/types';

import {
  useFlatTreeState,
  useCheckboxSelectionState,
  fetchChildren,
  setFolderOpenState,
  setItemSelectionState,
  setAllSelection,
  useBrowseLoadingStatus,
} from '../state';

import { DashboardsTree } from './DashboardsTree';

interface BrowseViewProps {
  height: number;
  width: number;
  folderUID: string | undefined;
}

export function BrowseView({ folderUID, width, height }: BrowseViewProps) {
  const status = useBrowseLoadingStatus(folderUID);
  const dispatch = useDispatch();
  const flatTree = useFlatTreeState(folderUID);
  const selectedItems = useCheckboxSelectionState();

  useEffect(() => {
    dispatch(fetchChildren(folderUID));
  }, [dispatch, folderUID]);

  const handleFolderClick = useCallback(
    (clickedFolderUID: string, isOpen: boolean) => {
      dispatch(setFolderOpenState({ folderUID: clickedFolderUID, isOpen }));

      if (isOpen) {
        dispatch(fetchChildren(clickedFolderUID));
      }
    },
    [dispatch]
  );

  const handleItemSelectionChange = useCallback(
    (item: DashboardViewItem, isSelected: boolean) => {
      dispatch(setItemSelectionState({ item, isSelected }));
    },
    [dispatch]
  );

  if (status === 'pending') {
    return <Spinner />;
  }

  if (status === 'fulfilled' && flatTree.length === 0) {
    return (
      <div style={{ width }}>
        <EmptyListCTA
          title={folderUID ? "This folder doesn't have any dashboards yet" : ''}
          buttonIcon="plus"
          buttonTitle="Create Dashboard"
          buttonLink={folderUID ? `dashboard/new?folderUid=${folderUID}` : 'dashboard/new'}
          proTip={folderUID && 'Add/move dashboards to your folder at ->'}
          proTipLink={folderUID && 'dashboards'}
          proTipLinkTitle={folderUID && 'Manage dashboards'}
          proTipTarget=""
        />
      </div>
    );
  }

  return (
    <DashboardsTree
      items={flatTree}
      width={width}
      height={height}
      selectedItems={selectedItems}
      onFolderClick={handleFolderClick}
      onAllSelectionChange={(newState) => dispatch(setAllSelection({ isSelected: newState }))}
      onItemSelectionChange={handleItemSelectionChange}
    />
  );
}
