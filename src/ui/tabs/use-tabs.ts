import gql from "graphql-tag";
import { useQuery, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import { uniq } from "lodash";
import { SourcesQuery } from "./__generated__/SourcesQuery";
import { SourcesSubscription } from "./__generated__/SourcesSubscription";

/**
 * Returns all sources
 */
export const SOURCES_QUERY = gql`
  query SourcesQuery {
    source
  }
`;

/**
 * Subscribe to all incoming logs, extracting just the source (e.g. stdin/websocket)
 */
export const SOURCES_SUBSCRIPTION = gql`
  subscription SourcesSubscription {
    logs {
      source
    }
  }
`;

/**
 * Hook to provide list of tabs to render.
 *
 * Provides new tabs as necessary depending on the source of incoming data
 */
export function useTabs() {
  const { data } = useQuery<SourcesQuery>(SOURCES_QUERY);

  const { data: subscribedData } = useSubscription<SourcesSubscription>(
    SOURCES_SUBSCRIPTION
  );

  const [sources, setSources] = useState(data?.source || []);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  function ensureTab(firstTab: string) {
    setSelectedTab((tab) => {
      if (!tab) {
        return firstTab;
      }

      return tab;
    });
  }

  useEffect(() => {
    if (data?.source && data?.source.length) {
      setSources((s) => uniq([...s, ...data?.source]));
      const firstTab = data.source[0];
      ensureTab(firstTab);
    }
  }, [data?.source]);

  const latestSource = subscribedData?.logs.source;

  useEffect(() => {
    if (latestSource) {
      setSources((s) => uniq([...s, latestSource]));
      ensureTab(latestSource);
    }
  }, [latestSource]);

  return { tabs: sources, selectedTab, setSelectedTab };
}