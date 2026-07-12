import type {
  useNodesSyncDraft,
} from './use-nodes-sync-draft'
import { toast } from '@langgenius/dify-ui/toast'
import {
  useCallback,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useStore as useAppStore } from '@/app/components/app/store'
import {
  DSL_EXPORT_CHECK,
} from '@/app/components/workflow/constants'
import { useEventEmitterContextContext } from '@/context/event-emitter'
import { exportAppBundle, exportAppConfig } from '@/service/apps'
import { fetchWorkflowDraft } from '@/service/workflow'
import { downloadBlob } from '@/utils/download'
import {
  useNodesSyncDraftByCanEdit,
} from './use-nodes-sync-draft'

type DoSyncWorkflowDraft = ReturnType<typeof useNodesSyncDraft>['doSyncWorkflowDraft']

const useDSLBase = (doSyncWorkflowDraft: DoSyncWorkflowDraft) => {
  const { t } = useTranslation()
  const { eventEmitter } = useEventEmitterContextContext()
  const [exporting, setExporting] = useState(false)

  const appDetail = useAppStore(s => s.appDetail)

  const handleExportDSL = useCallback(async (include = false, workflowId?: string, sandboxed = false) => {
    if (!appDetail)
      return

    if (exporting)
      return

    try {
      setExporting(true)
      await doSyncWorkflowDraft()

      if (sandboxed) {
        await exportAppBundle({
          appID: appDetail.id,
          include,
          workflowID: workflowId,
        })
      }
      else {
        const { data } = await exportAppConfig({
          appID: appDetail.id,
          include,
          workflowID: workflowId,
        })
        const file = new Blob([data], { type: 'application/yaml' })
        downloadBlob({ data: file, fileName: `${appDetail.name}.yaml` })
      }
    }
    catch {
      toast.error(t('exportFailed', { ns: 'app' }))
    }
    finally {
      setExporting(false)
    }
  }, [appDetail, t, doSyncWorkflowDraft, exporting])

  const exportCheck = useCallback(async () => {
    if (!appDetail)
      return
    try {
      const workflowDraft = await fetchWorkflowDraft(`/apps/${appDetail?.id}/workflows/draft`)
      const sandboxed = workflowDraft.features?.sandbox?.enabled === true
      const list = (workflowDraft.environment_variables || []).filter(env => env.value_type === 'secret')
      if (list.length === 0) {
        handleExportDSL(false, undefined, sandboxed)
        return
      }
      eventEmitter?.emit({
        type: DSL_EXPORT_CHECK,
        payload: {
          data: list,
          sandboxed,
        },
      } as any)
    }
    catch {
      toast.error(t('exportFailed', { ns: 'app' }))
    }
  }, [appDetail, eventEmitter, handleExportDSL, t])

  return {
    exportCheck,
    handleExportDSL,
  }
}

export const useDSLByCanEdit = (canEdit: boolean) => {
  const { doSyncWorkflowDraft } = useNodesSyncDraftByCanEdit(canEdit)

  return useDSLBase(doSyncWorkflowDraft)
}
