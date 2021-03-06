import * as React from "react";
import styled from "styled-components";
import { useEffect } from "react";
import { LogRow } from "../components/LogRow";
import { useScrollController, useScrollTracking } from "./scroll";
import { useUnseen } from "./use-unseen";
import { useLogs } from "./use-logs";

import DoubleDownArrowIcon from "./double-down-arrow.svg";

const LogRows = styled.div`
  margin-top: auto;
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  justify-content: flex-end;
`;

const NewRowsContainer = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  left: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rem;
`;

const NewLogsIndicatorContainer = styled.div`
  background-color: ${(props) => props.theme.colors.ok.main};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.ok.light};
  }
`;

const LoadMoreButton = styled.button`
  margin-left: auto;
  margin-right: auto;
  font-size: 1em;
  padding: 1rem;
  background-color: transparent;
  border: none;
  width: 100%;
  cursor: pointer;
  font-weight: bold;

  text-decoration: underline;
  &:hover {
    background-color: ${(props) => props.theme.colors.transparentHover};
  }

  &:focus {
    outline: 0;
  }
`;

const DownArrowContainer = styled.span`
  display: block;
  height: 16px;
  width: 16px;
  margin-left: 0.5rem;
`;

export default function LogsTab({
  filter,
  source,
}: {
  filter: string;
  source: string;
}) {
  const unseen = useUnseen<number>();

  const { scroller, ref } = useScrollController();

  const logs = useLogs(source, filter, {
    onReset() {
      unseen.clear();
    },
    onInit() {
      scroller?.scrollToBottom();
    },
    onChanged(latestRowId: number) {
      if (scroller?.shouldFollowNewLogs) {
        // The scroll view is scrolled all the way to the bottom, so we can scroll it automatically
        scroller?.scrollToBottom();
      } else {
        // The scroll view is frozen due to scroll upwards. Therefore we can add unseen logs to notify
        // the user
        unseen.add(latestRowId);
      }
    },
  });

  useEffect(() => {
    unseen.clear();
    scroller?.scrollToBottom();
  }, [source]);

  const onScroll = useScrollTracking({
    scrollController: scroller,
    onScrolledToRow: unseen.clear,
  });

  return (
    <Container ref={ref} onScroll={onScroll}>
      <LogRows>
        {logs.hasMore && (
          <LoadMoreButton
            type="button"
            onClick={() => logs.fetchMore()}
            disabled={logs.loadingMore}
          >
            Load more...
          </LoadMoreButton>
        )}
        {logs.logs.map((log) => (
          <LogRow key={log.rowid} row={log} />
        ))}
      </LogRows>
      <NewRowsContainer>
        {unseen.items.length ? (
          <NewLogsIndicatorContainer
            onClick={() => {
              scroller?.scrollToBottom();
            }}
          >
            {unseen.items.length} new items
            <DownArrowContainer>
              <DoubleDownArrowIcon />
            </DownArrowContainer>
          </NewLogsIndicatorContainer>
        ) : null}
      </NewRowsContainer>
    </Container>
  );
}
