import { css } from '@emotion/css';
import React, { useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Badge, Button, CodeEditor, Icon, Tooltip, useStyles2 } from '@grafana/ui';
import { TestTemplateAlert } from 'app/plugins/datasource/alertmanager/types';

import { AlertInstanceModalSelector } from './AlertInstanceModalSelector';
import { AlertTemplatePreviewData } from './TemplateData';
import { TemplateDataTable } from './TemplateDataDocs';
import { GenerateAlertDataModal } from './form/GenerateAlertDataModal';

export const RESET_TO_DEFAULT = 'Reset to default';

export function PayloadEditor({
  payload,
  setPayload,
  defaultPayload,
  setPayloadFormatError,
  payloadFormatError,
  onPayloadError,
}: {
  payload: string;
  defaultPayload: string;
  setPayload: React.Dispatch<React.SetStateAction<string>>;
  setPayloadFormatError: (value: React.SetStateAction<string | null>) => void;
  payloadFormatError: string | null;
  onPayloadError: () => void;
}) {
  const styles = useStyles2(getStyles);
  const onReset = () => {
    setPayload(defaultPayload);
  };

  const [isEditingAlertData, setIsEditingAlertData] = useState(false);

  const onCloseEditAlertModal = () => {
    setIsEditingAlertData(false);
  };

  const errorInPayloadJson = payloadFormatError !== null;

  const validatePayload = () => {
    try {
      const payloadObj = JSON.parse(payload);
      JSON.stringify([...payloadObj]); // check if it's iterable, in order to be able to add more data
      setPayloadFormatError(null);
    } catch (e) {
      setPayloadFormatError(e instanceof Error ? e.message : 'Invalid JSON.');
      onPayloadError();
      throw e;
    }
  };

  const onOpenEditAlertModal = () => {
    try {
      validatePayload();
      setIsEditingAlertData(true);
    } catch (e) {}
  };

  const onOpenAlertSelectorModal = () => {
    try {
      validatePayload();
      setIsAlertSelectorOpen(true);
    } catch (e) {}
  };

  const onAddAlertList = (alerts: TestTemplateAlert[]) => {
    onCloseEditAlertModal();
    setIsAlertSelectorOpen(false);
    setPayload((payload) => {
      const payloadObj = JSON.parse(payload);
      return JSON.stringify([...payloadObj, ...alerts], undefined, 2);
    });
  };

  const [isAlertSelectorOpen, setIsAlertSelectorOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.editor}>
        <div className={styles.title}>
          Payload data
          <Tooltip placement="top" content={<AlertTemplateDataTable />} theme="info">
            <Icon name="info-circle" className={styles.tooltip} size="xl" />
          </Tooltip>
        </div>

        <CodeEditor
          width={640}
          height={363}
          language={'json'}
          showLineNumbers={true}
          showMiniMap={false}
          value={payload}
          readOnly={false}
          onBlur={setPayload}
        />

        <div className={styles.buttonsWrapper}>
          <Button onClick={onReset} className={styles.button} icon="arrow-up" type="button" variant="secondary">
            {RESET_TO_DEFAULT}
          </Button>
          <Button
            onClick={onOpenEditAlertModal}
            className={styles.button}
            icon="plus-circle"
            type="button"
            variant="secondary"
            disabled={errorInPayloadJson}
          >
            Add alert data
          </Button>

          <Button
            type="button"
            variant="secondary"
            icon="bell"
            disabled={errorInPayloadJson}
            onClick={onOpenAlertSelectorModal}
          >
            Choose alert instances
          </Button>

          {payloadFormatError !== null && (
            <Badge
              color="orange"
              icon="exclamation-triangle"
              text={'JSON Error'}
              tooltip={'Fix errors in payload, and click Refresh preview button'}
            />
          )}
        </div>
      </div>
      <GenerateAlertDataModal isOpen={isEditingAlertData} onDismiss={onCloseEditAlertModal} onAccept={onAddAlertList} />

      <AlertInstanceModalSelector
        onSelect={onAddAlertList}
        isOpen={isAlertSelectorOpen}
        onClose={() => setIsAlertSelectorOpen(false)}
      />
    </div>
  );
}
const AlertTemplateDataTable = () => {
  const styles = useStyles2(getStyles);
  return (
    <TemplateDataTable
      caption={
        <h4 className={styles.templateDataDocsHeader}>
          Alert template data <span>This is the list of alert data fields used in the preview.</span>
        </h4>
      }
      dataItems={AlertTemplatePreviewData}
    />
  );
};
const getStyles = (theme: GrafanaTheme2) => ({
  jsonEditor: css`
    width: 605px;
    height: 363px;
  `,
  buttonsWrapper: css`
    margin-top: ${theme.spacing(1)};
    display: flex;
  `,
  button: css`
    flex: none;
    width: fit-content;
    padding-right: ${theme.spacing(1)};
    margin-right: ${theme.spacing(1)};
  `,
  title: css`
    font-weight: ${theme.typography.fontWeightBold};
  `,
  wrapper: css`
    padding-top: 38px;
  `,
  tooltip: css`
    padding-left: ${theme.spacing(1)};
  `,
  editor: css`
    display: flex;
    flex-direction: column;
    margin-top: ${theme.spacing(-1)};
  `,
  templateDataDocsHeader: css`
    color: ${theme.colors.text.primary};

    span {
      color: ${theme.colors.text.secondary};
      font-size: ${theme.typography.bodySmall.fontSize};
    }
  `,
});
