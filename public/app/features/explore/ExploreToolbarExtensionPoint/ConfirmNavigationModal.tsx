import React, { ReactElement } from 'react';

import { locationUtil, PluginExtensionLink } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Button, Modal, VerticalGroup } from '@grafana/ui';

type Props = {
  onDismiss: () => void;
  extension: PluginExtensionLink;
};

export function ConfirmNavigationModal(props: Props): ReactElement {
  const { onDismiss, extension } = props;
  const openInNewTab = () => {
    global.open(locationUtil.assureBaseUrl(extension.path), '_blank');
    onDismiss();
  };
  const openInCurrentTab = () => locationService.push(extension.path);

  return (
    <Modal title={extension.title} isOpen onDismiss={onDismiss}>
      <VerticalGroup spacing="sm">
        <p>Do you want to proceed in the current tab or open a new tab?</p>
      </VerticalGroup>
      <Modal.ButtonRow>
        <Button onClick={onDismiss} fill="outline" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="secondary" onClick={openInNewTab} icon="external-link-alt">
          Open in new tab
        </Button>
        <Button type="submit" variant="primary" onClick={openInCurrentTab} icon="apps">
          Open
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
}
