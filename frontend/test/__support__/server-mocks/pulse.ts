import fetchMock from "fetch-mock";

import type { ChannelApiResponse } from "metabase-types/api";

export const setupNotificationChannelsEndpoints = (
  channelData: ChannelApiResponse["channels"],
) => {
  fetchMock.get("path:/api/pulse/form_input", { channels: channelData });
};
