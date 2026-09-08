import type { PluginSurfaceProps, PluginTheme } from "@getpaseo/plugin";
import { Icon, useRpc } from "@getpaseo/plugin";
import { useQuery } from "@tanstack/react-query";
import React, { type ReactNode, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  branchGardenScan,
  type BranchCategory,
  type BranchReason,
  type BranchSnapshot,
  type RepositorySnapshot,
  type WorkspaceSnapshot,
} from "./branch-garden.shared";
import { filterRepositories, type RepositoryFilter } from "./branch-garden.view";

const CATEGORY_LABELS: Record<BranchCategory, string> = {
  cleanup_candidate: "Cleanup candidates",
  review: "Needs review",
  keep: "Keep",
};

const REASON_LABELS: Record<BranchReason, string> = {
  default_branch: "Default branch",
  checked_out: "In use by a worktree",
  insufficient_data: "Not enough information",
  unmerged_tracked: "Unmerged · upstream exists",
  unmerged_orphaned: "Unmerged · no upstream",
  merged_tracked: "Merged · upstream exists",
  merged_orphaned: "Merged · no upstream",
};

const FILTERS: ReadonlyArray<{ id: RepositoryFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "cleanup_candidate", label: "Cleanup candidates" },
  { id: "review", label: "Needs review" },
];

function createStyles(theme: PluginTheme, compact: boolean) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.surface0 },
    content: {
      width: "100%",
      padding: compact ? 16 : 24,
      paddingBottom: compact ? 32 : 48,
    },
    shell: {
      width: "100%",
      maxWidth: 1180,
      alignSelf: "center",
      gap: 24,
    },
    overview: {
      flexDirection: compact ? "column" : "row",
      alignItems: compact ? "stretch" : "center",
      justifyContent: "space-between",
      gap: 16,
    },
    overviewCopy: { flex: 1, minWidth: 0, gap: 8 },
    description: {
      color: theme.colors.foreground,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "400",
    },
    metadata: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
    metaText: { color: theme.colors.foregroundMuted, fontSize: 10, lineHeight: 16, fontWeight: "400" },
    dotSeparator: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.colors.foregroundMuted,
    },
    primaryButton: {
      minHeight: 44,
      minWidth: compact ? undefined : 120,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.accent,
    },
    primaryButtonText: {
      color: theme.colors.accentForeground,
      fontSize: 12,
      fontWeight: "500",
      textAlign: "center",
    },
    pressed: { opacity: 0.76 },
    disabled: { opacity: 0.5 },
    section: { gap: 12 },
    sectionHeader: {
      flexDirection: compact ? "column" : "row",
      alignItems: compact ? "stretch" : "flex-end",
      justifyContent: "space-between",
      gap: 12,
    },
    sectionCopy: { flex: 1, minWidth: 0, gap: 4 },
    sectionTitle: {
      color: theme.colors.foreground,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
    },
    sectionDescription: {
      color: theme.colors.foregroundMuted,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "400",
    },
    summary: {
      flexDirection: "row",
      flexWrap: "wrap",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface1,
      padding: 8,
      gap: 4,
    },
    summaryItem: {
      flexGrow: 1,
      flexBasis: compact ? "46%" : 0,
      minWidth: compact ? 128 : 0,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 4,
    },
    summaryValue: {
      color: theme.colors.foreground,
      fontSize: compact ? 20 : 24,
      lineHeight: compact ? 26 : 30,
      fontWeight: "500",
    },
    summaryValueWarning: { color: theme.colors.statusWarning },
    summaryLabel: {
      color: theme.colors.foregroundMuted,
      fontSize: 10,
      lineHeight: 15,
      fontWeight: "400",
    },
    filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterButton: {
      minHeight: 44,
      minWidth: compact ? 0 : 96,
      flex: compact ? 1 : 0,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    filterButtonActive: { borderColor: theme.colors.accent },
    filterText: {
      color: theme.colors.foregroundMuted,
      fontSize: 12,
      fontWeight: "500",
      textAlign: "center",
    },
    filterTextActive: { color: theme.colors.foreground },
    notice: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface1,
      padding: 16,
      gap: 8,
    },
    noticeWarning: { borderColor: theme.colors.statusWarning },
    noticeError: { borderColor: theme.colors.statusDanger },
    noticeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    noticeTitle: {
      flex: 1,
      minWidth: 0,
      color: theme.colors.foreground,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600",
    },
    noticeWarningTitle: { color: theme.colors.statusWarning },
    noticeErrorTitle: { color: theme.colors.statusDanger },
    noticeText: { color: theme.colors.foregroundMuted, fontSize: 12, lineHeight: 18, fontWeight: "400" },
    tree: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface1,
      overflow: "hidden",
    },
    treeHeader: {
      minHeight: 44,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    treeHeaderMain: { flex: 1, paddingLeft: 28 },
    treeHeaderText: {
      color: theme.colors.foregroundMuted,
      fontSize: 10,
      lineHeight: 15,
      fontWeight: "500",
    },
    treeHeaderStatus: { width: 180, textAlign: "right" },
    treeHeaderBase: { width: 200 },
    divider: { height: 1, backgroundColor: theme.colors.border },
    repositoryRow: {
      minHeight: 64,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    disclosure: {
      width: 20,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    repositoryIdentity: { flex: 1, minWidth: 0, gap: 2 },
    repositoryName: {
      color: theme.colors.foreground,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },
    repositoryPath: { color: theme.colors.foregroundMuted, fontSize: 10, lineHeight: 15, fontWeight: "400" },
    compactFacts: { color: theme.colors.foregroundMuted, fontSize: 10, lineHeight: 15, fontWeight: "400" },
    repositoryStatus: { width: 180, alignItems: "flex-end", gap: 2 },
    repositoryStatusValue: { color: theme.colors.foreground, fontSize: 12, lineHeight: 18, fontWeight: "500" },
    repositoryStatusSuccess: { color: theme.colors.statusSuccess },
    repositoryStatusWarning: { color: theme.colors.statusWarning },
    repositoryStatusError: { color: theme.colors.statusDanger },
    repositoryStatusCaption: { color: theme.colors.foregroundMuted, fontSize: 10, lineHeight: 15 },
    repositoryBase: {
      width: 200,
      color: theme.colors.foregroundMuted,
      fontSize: 10,
      lineHeight: 15,
      fontWeight: "400",
    },
    details: {
      paddingLeft: compact ? 16 : 48,
      paddingRight: 16,
      paddingBottom: 16,
      gap: 12,
    },
    detailMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
    detailMetaText: { color: theme.colors.foregroundMuted, fontSize: 10, lineHeight: 15, fontWeight: "400" },
    errorText: { color: theme.colors.statusDanger, fontSize: 12, lineHeight: 18, fontWeight: "400" },
    group: { gap: 4 },
    groupHeader: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 8,
    },
    groupLabel: { color: theme.colors.foreground, fontSize: 12, lineHeight: 18, fontWeight: "600" },
    groupCount: { color: theme.colors.foregroundMuted, fontSize: 10, lineHeight: 15, fontWeight: "400" },
    dataRow: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    rowCopy: { flex: 1, minWidth: 0, gap: 2 },
    rowTitle: { color: theme.colors.foreground, fontSize: 14, lineHeight: 20, fontWeight: "400" },
    rowSubtitle: { color: theme.colors.foregroundMuted, fontSize: 10, lineHeight: 15, fontWeight: "400" },
    workspacePath: {
      width: 320,
      color: theme.colors.foregroundMuted,
      fontSize: 10,
      lineHeight: 15,
      textAlign: "right",
      fontWeight: "400",
    },
    workspaceError: { color: theme.colors.statusDanger, fontSize: 10, lineHeight: 15, fontWeight: "400" },
    statusWarningText: { color: theme.colors.statusWarning },
    branchEvidence: {
      width: 300,
      color: theme.colors.foregroundMuted,
      fontSize: 10,
      lineHeight: 15,
      textAlign: "right",
      fontWeight: "400",
    },
    keepToggle: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 8,
    },
    keepToggleText: { color: theme.colors.foreground, fontSize: 12, lineHeight: 18, fontWeight: "500" },
    keepToggleHint: { color: theme.colors.foregroundMuted, fontSize: 10, marginLeft: "auto" },
    statePanel: {
      minHeight: 220,
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface1,
    },
    stateIcon: { marginBottom: 4 },
    stateTitle: {
      color: theme.colors.foreground,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600",
      textAlign: "center",
    },
    stateText: {
      color: theme.colors.foregroundMuted,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "400",
      textAlign: "center",
      maxWidth: 520,
    },
    footnote: {
      color: theme.colors.foregroundMuted,
      fontSize: 10,
      lineHeight: 16,
      fontWeight: "400",
      textAlign: "center",
    },
  });
}

type Styles = ReturnType<typeof createStyles>;

interface NoticeProps {
  children: ReactNode;
  styles: Styles;
  theme: PluginTheme;
  title: string;
  tone: "warning" | "error";
}

function Notice({ children, styles, theme, title, tone }: NoticeProps) {
  const error = tone === "error";
  return (
    <View style={[styles.notice, error ? styles.noticeError : styles.noticeWarning]}>
      <View style={styles.noticeHeader}>
        <Icon
          name={error ? "CircleAlert" : "TriangleAlert"}
          size={16}
          color={error ? theme.colors.statusDanger : theme.colors.statusWarning}
        />
        <Text style={[
          styles.noticeTitle,
          error ? styles.noticeErrorTitle : styles.noticeWarningTitle,
        ]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function formatScanTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "An unexpected error occurred.";
}

function repositoryStatus(repository: RepositorySnapshot): {
  caption: string;
  tone: "success" | "warning" | "error";
  value: string;
} {
  if (repository.error) {
    return { value: "Scan needed", caption: "Repository error", tone: "error" };
  }
  if (repository.cleanupCandidateCount > 0) {
    return {
      value: `Cleanup: ${repository.cleanupCandidateCount}`,
      caption: repository.reviewCount > 0 ? `Review: ${repository.reviewCount}` : "Merged · not checked out",
      tone: "warning",
    };
  }
  if (repository.reviewCount > 0) {
    return { value: `Review: ${repository.reviewCount}`, caption: "Check branch details", tone: "warning" };
  }
  return { value: "No action needed", caption: "Nothing to review", tone: "success" };
}

function workspaceHead(workspace: WorkspaceSnapshot): string {
  if (workspace.currentBranch) {
    return workspace.currentBranch;
  }
  if (workspace.detached) {
    return `detached${workspace.headOid ? ` · ${workspace.headOid.slice(0, 8)}` : ""}`;
  }
  return "HEAD unknown";
}

function branchEvidence(branch: BranchSnapshot): string {
  const merge = branch.mergeState === "merged"
    ? "Merged"
    : branch.mergeState === "unmerged"
      ? "Unmerged"
      : "Merge status unknown";
  const upstream = branch.upstreamState === "tracked"
    ? branch.upstreamRef ?? "Upstream exists"
    : branch.upstreamState === "gone"
      ? "Upstream gone"
      : branch.upstreamState === "local_only"
        ? "Local only"
        : "Upstream unknown";
  const checkout = branch.checkoutState === "checked_out"
    ? `checkout ${branch.checkedOutAt.length}`
    : branch.checkoutState === "unknown"
      ? "Checkout status unknown"
      : null;
  return [merge, upstream, checkout].filter(Boolean).join(" · ");
}

function SummaryMetric({
  label,
  styles,
  tone = "neutral",
  value,
}: {
  label: string;
  styles: Styles;
  tone?: "neutral" | "warning";
  value: number;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[
        styles.summaryValue,
        tone === "warning" && value > 0 ? styles.summaryValueWarning : null,
      ]}>
        {value}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function WorkspaceRow({
  compact,
  styles,
  workspace,
}: {
  compact: boolean;
  styles: Styles;
  workspace: WorkspaceSnapshot;
}) {
  const dirtyLabel = workspace.isDirty === true
    ? "Uncommitted changes"
    : workspace.isDirty === false
      ? "clean"
      : "Status unknown";

  return (
    <View style={styles.dataRow}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={1}>{workspace.name}</Text>
        <Text
          style={[
            styles.rowSubtitle,
            workspace.isDirty === true ? styles.statusWarningText : null,
          ]}
          numberOfLines={1}
        >
          {workspaceHead(workspace)} · {dirtyLabel}
        </Text>
        {compact ? <Text style={styles.rowSubtitle} numberOfLines={2}>{workspace.directory}</Text> : null}
        {workspace.error ? <Text style={styles.workspaceError}>{workspace.error}</Text> : null}
      </View>
      {!compact ? <Text style={styles.workspacePath} numberOfLines={1}>{workspace.directory}</Text> : null}
    </View>
  );
}

function BranchRow({ branch, compact, styles }: {
  branch: BranchSnapshot;
  compact: boolean;
  styles: Styles;
}) {
  return (
    <View style={styles.dataRow}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={compact ? 2 : 1}>{branch.name}</Text>
        <Text style={styles.rowSubtitle}>{REASON_LABELS[branch.reason]}</Text>
        {compact ? <Text style={styles.rowSubtitle}>{branchEvidence(branch)}</Text> : null}
      </View>
      {!compact ? <Text style={styles.branchEvidence} numberOfLines={1}>{branchEvidence(branch)}</Text> : null}
    </View>
  );
}

function BranchGroup({
  branches,
  category,
  compact,
  styles,
}: {
  branches: BranchSnapshot[];
  category: BranchCategory;
  compact: boolean;
  styles: Styles;
}) {
  if (branches.length === 0) {
    return null;
  }

  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text style={[
          styles.groupLabel,
          category === "keep" ? null : styles.statusWarningText,
        ]}>
          {CATEGORY_LABELS[category]}
        </Text>
        <Text style={styles.groupCount}>{branches.length}</Text>
      </View>
      {branches.map((branch) => (
        <BranchRow key={branch.ref} branch={branch} compact={compact} styles={styles} />
      ))}
    </View>
  );
}

function RepositoryNode({
  compact,
  focus,
  repository,
  styles,
  theme,
}: {
  compact: boolean;
  focus: RepositoryFilter;
  repository: RepositorySnapshot;
  styles: Styles;
  theme: PluginTheme;
}) {
  const [open, setOpen] = useState(
    repository.cleanupCandidateCount > 0 || repository.reviewCount > 0 || Boolean(repository.error),
  );
  const [showKeep, setShowKeep] = useState(false);
  const status = repositoryStatus(repository);
  const cleanupBranches = repository.branches.filter((branch) => branch.category === "cleanup_candidate");
  const reviewBranches = repository.branches.filter((branch) => branch.category === "review");
  const keepBranches = repository.branches.filter((branch) => branch.category === "keep");
  const baseLabel = repository.base.state === "resolved"
    ? repository.base.ref ?? "Base ref unknown"
    : "Base ref unknown";

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${open ? "Collapse" : "Expand"} ${repository.name} repository`}
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.repositoryRow, pressed ? styles.pressed : null]}
      >
        <View style={styles.disclosure}>
          <Icon
            name={open ? "ChevronDown" : "ChevronRight"}
            size={16}
            color={theme.colors.foregroundMuted}
          />
        </View>
        <View style={styles.repositoryIdentity}>
          <Text style={styles.repositoryName} numberOfLines={1}>{repository.name}</Text>
          <Text style={styles.repositoryPath} numberOfLines={1}>{repository.rootPath}</Text>
          {compact ? (
            <>
              <Text style={[
                styles.compactFacts,
                status.tone === "error"
                  ? styles.repositoryStatusError
                  : status.tone === "warning"
                    ? styles.repositoryStatusWarning
                    : styles.repositoryStatusSuccess,
              ]}>
                {status.value}
              </Text>
              <Text style={styles.compactFacts} numberOfLines={1}>
                Branches {repository.branchCount} · Active workspaces {repository.workspaces.length}
              </Text>
            </>
          ) : null}
        </View>
        {!compact ? (
          <>
            <View style={styles.repositoryStatus}>
              <Text style={[
                styles.repositoryStatusValue,
                status.tone === "error"
                  ? styles.repositoryStatusError
                  : status.tone === "warning"
                    ? styles.repositoryStatusWarning
                    : styles.repositoryStatusSuccess,
              ]}>
                {status.value}
              </Text>
              <Text style={styles.repositoryStatusCaption}>{status.caption}</Text>
            </View>
            <Text style={styles.repositoryBase} numberOfLines={1}>{baseLabel}</Text>
          </>
        ) : null}
      </Pressable>

      {open ? (
        <View style={styles.details}>
          <View style={styles.detailMeta}>
            <Text style={styles.detailMetaText}>Branches {repository.branchCount}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.detailMetaText}>Active workspaces {repository.workspaces.length}</Text>
            {compact ? (
              <>
                <View style={styles.dotSeparator} />
                <Text style={styles.detailMetaText} numberOfLines={1}>{baseLabel}</Text>
              </>
            ) : null}
          </View>

          {repository.error ? <Text style={styles.errorText}>{repository.error}</Text> : null}

          {repository.workspaces.length > 0 ? (
            <View style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupLabel}>Active workspaces</Text>
                <Text style={styles.groupCount}>{repository.workspaces.length}</Text>
              </View>
              {repository.workspaces.map((workspace) => (
                <WorkspaceRow key={workspace.id} compact={compact} styles={styles} workspace={workspace} />
              ))}
            </View>
          ) : (
            <Text style={styles.detailMetaText}>
              Scanned the project root; no active workspaces.
            </Text>
          )}

          {focus !== "review" ? (
            <BranchGroup
              branches={cleanupBranches}
              category="cleanup_candidate"
              compact={compact}
              styles={styles}
            />
          ) : null}
          {focus !== "cleanup_candidate" ? (
            <BranchGroup branches={reviewBranches} category="review" compact={compact} styles={styles} />
          ) : null}

          {focus === "all" && keepBranches.length > 0 ? (
            <View style={styles.group}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${showKeep ? "Collapse" : "Expand"} kept branches in ${repository.name}`}
                accessibilityState={{ expanded: showKeep }}
                aria-expanded={showKeep}
                onPress={() => setShowKeep((value) => !value)}
                style={({ pressed }) => [styles.keepToggle, pressed ? styles.pressed : null]}
              >
                <View style={styles.disclosure}>
                  <Icon
                    name={showKeep ? "ChevronDown" : "ChevronRight"}
                    size={16}
                    color={theme.colors.foregroundMuted}
                  />
                </View>
                <Text style={styles.keepToggleText}>Kept branches {keepBranches.length}</Text>
                <Text style={styles.keepToggleHint}>{showKeep ? "Collapse" : "Expand"}</Text>
              </Pressable>
              {showKeep
                ? keepBranches.map((branch) => (
                    <BranchRow key={branch.ref} branch={branch} compact={compact} styles={styles} />
                  ))
                : null}
            </View>
          ) : null}

          {repository.branches.length === 0 && !repository.error ? (
            <Text style={styles.detailMetaText}>No local branches to show.</Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.divider} />
    </View>
  );
}

function FullScreenState({
  kind = "loading",
  message,
  onRetry,
  retrying,
  styles,
  theme,
  title,
}: {
  kind?: "loading" | "error";
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  styles: Styles;
  theme: PluginTheme;
  title: string;
}) {
  return (
    <View style={[styles.screen, styles.content]} testID="branch-garden-surface">
      <View style={styles.shell}>
        <View style={styles.statePanel}>
          <View style={styles.stateIcon}>
            <Icon
              name={kind === "error" ? "CircleAlert" : "RefreshCw"}
              size={24}
              color={kind === "error" ? theme.colors.statusDanger : theme.colors.foregroundMuted}
            />
          </View>
          <Text style={styles.stateTitle}>{title}</Text>
          <Text style={styles.stateText}>{message}</Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry Branch Garden scan"
              disabled={retrying}
              onPress={onRetry}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed ? styles.pressed : null,
                retrying ? styles.disabled : null,
              ]}
            >
              <Icon name="RefreshCw" size={16} color={theme.colors.accentForeground} />
              <Text style={styles.primaryButtonText}>{retrying ? "Scanning…" : "Try again"}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function MainSurface({ theme, layout, host }: PluginSurfaceProps) {
  const scan = useRpc(branchGardenScan);
  const [filter, setFilter] = useState<RepositoryFilter>("all");
  const styles = useMemo(() => createStyles(theme, layout.compact), [theme, layout.compact]);
  const query = useQuery({
    queryKey: ["branch-garden", "scan", host.id],
    queryFn: () => scan({}),
    staleTime: Infinity,
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (query.isPending && !query.data) {
    return (
      <FullScreenState
        message="Reading projects, active workspaces and local Git data on the selected host."
        styles={styles}
        theme={theme}
        title="Loading projects and branches"
      />
    );
  }

  if (!query.data) {
    return (
      <FullScreenState
        kind="error"
        message={errorMessage(query.error)}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
        styles={styles}
        theme={theme}
        title="Could not load branch status"
      />
    );
  }

  const result = query.data;
  const visibleRepositories = filterRepositories(result.repositories, filter);
  const filterCounts: Record<RepositoryFilter, number> = {
    all: result.repositories.length,
    cleanup_candidate: filterRepositories(result.repositories, "cleanup_candidate").length,
    review: filterRepositories(result.repositories, "review").length,
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} testID="branch-garden-surface">
      <View style={styles.shell}>
        <View style={styles.overview}>
          <View style={styles.overviewCopy}>
            <Text style={styles.description}>
              Read-only Git status for the selected host’s projects and active workspaces.
            </Text>
            <View style={styles.metadata}>
              <Text style={styles.metaText}>Read-only</Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.metaText}>Last scanned {formatScanTime(result.scannedAt)}</Text>
              {result.skippedNonGitProjectCount > 0 ? (
                <>
                  <View style={styles.dotSeparator} />
                  <Text style={styles.metaText}>
                    Non-Git projects skipped: {result.skippedNonGitProjectCount}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh branch status"
            accessibilityState={{ disabled: query.isFetching }}
            disabled={query.isFetching}
            onPress={() => void query.refetch()}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.pressed : null,
              query.isFetching ? styles.disabled : null,
            ]}
          >
            <Icon name="RefreshCw" size={16} color={theme.colors.accentForeground} />
            <Text style={styles.primaryButtonText}>{query.isFetching ? "Scanning…" : "Refresh"}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.sectionDescription}>Totals from the current scan.</Text>
          </View>
          <View style={styles.summary}>
            <SummaryMetric
              label="Cleanup candidates"
              styles={styles}
              tone="warning"
              value={result.summary.cleanupCandidateCount}
            />
            <SummaryMetric label="Git projects" styles={styles} value={result.summary.projectCount} />
            <SummaryMetric
              label="Active workspaces"
              styles={styles}
              value={result.summary.workspaceCount}
            />
            <SummaryMetric label="Repositories" styles={styles} value={result.summary.repositoryCount} />
            <SummaryMetric label="Local branches" styles={styles} value={result.summary.branchCount} />
            <SummaryMetric label="Warnings" styles={styles} tone="warning" value={result.summary.warningCount} />
          </View>
        </View>

        {query.error ? (
          <Notice
            styles={styles}
            theme={theme}
            title="Showing the last successful scan"
            tone="error"
          >
            <Text style={styles.noticeText}>Refresh failed: {errorMessage(query.error)}</Text>
          </Notice>
        ) : null}

        {result.warnings.length > 0 ? (
          <Notice
            styles={styles}
            theme={theme}
            title={`Some items could not be fully scanned · ${result.warnings.length}`}
            tone="warning"
          >
            {result.warnings.map((warning, index) => (
              <Text key={`${index}:${warning}`} style={styles.noticeText}>• {warning}</Text>
            ))}
          </Notice>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Repositories</Text>
              <Text style={styles.sectionDescription}>
                Expand a repository to inspect its active workspaces and branch details.
              </Text>
            </View>
            <View accessibilityRole="tablist" style={styles.filters}>
              {FILTERS.map((item) => {
                const selected = filter === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="tab"
                    accessibilityLabel={`${item.label}: ${filterCounts[item.id]} ${filterCounts[item.id] === 1 ? "repository" : "repositories"}`}
                    accessibilityState={{ selected }}
                    aria-selected={selected}
                    onPress={() => setFilter(item.id)}
                    style={({ pressed }) => [
                      styles.filterButton,
                      selected ? styles.filterButtonActive : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text style={[styles.filterText, selected ? styles.filterTextActive : null]}>
                      {item.label} {filterCounts[item.id]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {result.repositories.length === 0 ? (
            <View style={styles.statePanel}>
              <View style={styles.stateIcon}>
                <Icon name="GitBranch" size={24} color={theme.colors.foregroundMuted} />
              </View>
              <Text style={styles.stateTitle}>No Git repositories to show</Text>
              <Text style={styles.stateText}>
                Git projects registered on the selected host will appear here.
              </Text>
            </View>
          ) : visibleRepositories.length === 0 ? (
            <View style={styles.statePanel}>
              <View style={styles.stateIcon}>
                <Icon name="Search" size={24} color={theme.colors.foregroundMuted} />
              </View>
              <Text style={styles.stateTitle}>No repositories match this filter</Text>
              <Text style={styles.stateText}>Select another filter to see more repositories.</Text>
            </View>
          ) : (
            <View style={styles.tree}>
              {!layout.compact ? (
                <>
                  <View style={styles.treeHeader}>
                    <Text style={[styles.treeHeaderText, styles.treeHeaderMain]}>Repositories</Text>
                    <Text style={[styles.treeHeaderText, styles.treeHeaderStatus]}>Status</Text>
                    <Text style={[styles.treeHeaderText, styles.treeHeaderBase]}>Base ref</Text>
                  </View>
                  <View style={styles.divider} />
                </>
              ) : null}
              {visibleRepositories.map((repository) => (
                <RepositoryNode
                  key={repository.id}
                  compact={layout.compact}
                  focus={filter}
                  repository={repository}
                  styles={styles}
                  theme={theme}
                />
              ))}
            </View>
          )}
        </View>

        <Text style={styles.footnote}>Projects, workspaces and Git refs are never modified.</Text>
      </View>
    </ScrollView>
  );
}
