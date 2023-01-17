import { store } from '../views/store';
import { bootstrapData } from '../preamble';
import { URL_PARAMS } from 'src/constants';
import { getFilterValue } from 'src/dashboard/components/nativeFilters/FilterBar/keyValue';
import { postFormData } from 'src/explore/exploreUtils/formData';
import captureChartSnapshot from 'src/utils/captureChartSnapshot';
import {
  getDashboardPermalink as getDashboardPermalinkUtil,
  getUrlParam,
} from '../utils/urlUtils';

type Size = {
  width: number;
  height: number;
};

type EmbeddedSupersetApi = {
  getScrollSize: () => Size;
  getDashboardPermalink: ({ anchor }: { anchor: string }) => Promise<string>;
  getActiveTabs: () => string[];
  getEmbedChartFormDataKey: ({
    chartId,
  }: {
    chartId: string;
  }) => Promise<{ formDataKey: string; sliceId: number }>;
  getChartSnapshot: (chartId: string) => Promise<string>;
};

const getScrollSize = (): Size => ({
  width: document.body.scrollWidth,
  height: document.body.scrollHeight,
});

const getDashboardPermalink = async ({
  anchor,
}: {
  anchor: string;
}): Promise<string> => {
  const dashboardId =
    store.getState()?.dashboardInfo?.id ||
    bootstrapData?.embedded!.dashboard_id;

  let filterState = {};
  const nativeFiltersKey = getUrlParam(URL_PARAMS.nativeFiltersKey);
  if (nativeFiltersKey && dashboardId) {
    filterState = await getFilterValue(dashboardId, nativeFiltersKey);
  }

  return getDashboardPermalinkUtil({
    dashboardId,
    filterState,
    hash: anchor,
  });
};

const getEmbedChartFormDataKey = async ({
  chartId,
}: {
  chartId: string;
}): Promise<{ formDataKey: string; sliceId: number }> => {
  const { meta } = store.getState()?.dashboardInfo.position_data[chartId];
  const chartPK = meta?.chartId;
  const { formData } = store.getState()?.charts[chartPK];
  const { datasource } = formData;
  const dataSourceId = parseInt(datasource.replace('__table'), 10);
  const key = await postFormData(dataSourceId, formData, chartPK);
  return Promise.resolve({ formDataKey: key, sliceId: chartPK });
};

const getActiveTabs = () => store?.getState()?.dashboardState?.activeTabs || [];

const getChartSnapshot = async (chartId: string): Promise<string> =>
  captureChartSnapshot(chartId);

export const embeddedApi: EmbeddedSupersetApi = {
  getScrollSize,
  getDashboardPermalink,
  getActiveTabs,
  getEmbedChartFormDataKey,
  getChartSnapshot,
};
