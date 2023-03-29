import React, { lazy, ReactElement, Suspense, useMemo, useState } from 'react';

import {
  isPluginExtensionCommand,
  isPluginExtensionLink,
  PluginExtension,
  PluginExtensionLink,
  PluginExtensionPlacements,
  SelectableValue,
} from '@grafana/data';
import { getPluginExtensions } from '@grafana/runtime';
import { ButtonGroup, ButtonSelect } from '@grafana/ui';
import { ExploreId } from 'app/types';

import { ConfirmNavigationModal } from './ConfirmNavigationModal';

const AddToDashboard = lazy(() =>
  import('../AddToDashboard').then(({ AddToDashboard }) => ({ default: AddToDashboard }))
);

type Props = {
  exploreId: ExploreId;
};

type ExploreExtensionPointContext = {};

export function ExploreToolbarExtensionPoint(props: Props): ReactElement {
  const { exploreId } = props;
  const [extension, setExtension] = useState<PluginExtensionLink | undefined>();
  const context = useExtensionPointContext(props);
  const options = useExtensionsAsOptions(context);

  if (options.length === 0) {
    return (
      <Suspense fallback={null}>
        <AddToDashboard exploreId={exploreId} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <ButtonGroup>
        <AddToDashboard key="add-to-dashboard" exploreId={exploreId} />
        <ButtonSelect
          key="select-extension"
          variant="canvas"
          options={options}
          onChange={(option) => {
            const extension = option.value;

            if (isPluginExtensionLink(extension)) {
              return setExtension(extension);
            }

            if (isPluginExtensionCommand(extension)) {
              return extension.callHandlerWithContext();
            }
          }}
        />
      </ButtonGroup>
      {!!extension && <ConfirmNavigationModal extension={extension} onDismiss={() => setExtension(undefined)} />}
    </Suspense>
  );
}

function useExtensionPointContext(props: Props): ExploreExtensionPointContext {
  return useMemo(() => {
    return {};
  }, []);
}

function useExtensionsAsOptions(context: ExploreExtensionPointContext): Array<SelectableValue<PluginExtension>> {
  return useMemo(() => {
    const { extensions } = getPluginExtensions({
      placement: PluginExtensionPlacements.ExploreToolbar,
      context: context,
    });

    return extensions.map((extension) => ({
      label: extension.title,
      title: extension.title,
      description: extension.description,
      value: extension,
    }));
  }, [context]);
}
