"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout";
import { useQueueStore, QueueItem } from "@/lib/stores";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  {
    icon: typeof Clock;
    label: string;
    color: string;
    animate?: boolean;
  }
> = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-yellow-500",
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    color: "text-blue-500",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-green-500",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    color: "text-red-500",
  },
};

function QueueItemCard({ item }: { item: QueueItem }) {
  const { removeItem, retryItem } = useQueueStore();
  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-zinc-900 rounded-xl p-4 border border-white/5"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0",
            config.color
          )}
        >
          <StatusIcon
            className={cn("w-5 h-5", config.animate && "animate-spin")}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={cn("text-sm font-medium", config.color)}>
              {config.label}
            </span>
            <span className="text-xs text-zinc-500">
              {item.type === "video" ? "Video" : "Image"}
            </span>
          </div>

          <p className="text-sm text-zinc-300 line-clamp-2 mb-2">
            {item.prompt}
          </p>

          {/* Progress bar for processing items */}
          {item.status === "processing" && item.progress > 0 && (
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
              />
            </div>
          )}

          {/* Error message */}
          {item.status === "failed" && item.error && (
            <p className="text-xs text-red-400 mb-2">{item.error}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{item.model}</span>
            <span>-</span>
            <span>{item.aspectRatio}</span>
            {item.duration && (
              <>
                <span>-</span>
                <span>{item.duration}s</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {item.status === "completed" && item.resultUrl && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(item.resultUrl, "_blank")}
              >
                <Play className="w-3 h-3 mr-1" />
                View
              </Button>
            )}
            {item.status === "failed" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => retryItem(item.id)}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-red-400"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function QueuePage() {
  const { items, clearCompleted, clearFailed } = useQueueStore();

  const pendingItems = items.filter((i) => i.status === "pending");
  const processingItems = items.filter((i) => i.status === "processing");
  const completedItems = items.filter((i) => i.status === "completed");
  const failedItems = items.filter((i) => i.status === "failed");

  const hasItems = items.length > 0;
  const hasCompleted = completedItems.length > 0;
  const hasFailed = failedItems.length > 0;

  return (
    <div className="min-h-screen pb-24">
      <Header
        title="Queue"
        actions={
          hasItems && (
            <div className="flex items-center gap-2">
              {hasCompleted && (
                <Button variant="ghost" size="sm" onClick={clearCompleted}>
                  Clear Done
                </Button>
              )}
              {hasFailed && (
                <Button variant="ghost" size="sm" onClick={clearFailed}>
                  Clear Failed
                </Button>
              )}
            </div>
          )
        }
      />

      <div className="p-4">
        {!hasItems ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold mb-1">No queued items</h2>
            <p className="text-sm text-zinc-500">
              Video generation jobs will appear here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Processing */}
            {processingItems.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing ({processingItems.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {processingItems.map((item) => (
                      <QueueItemCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* Pending */}
            {pendingItems.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-medium text-zinc-400">
                  Pending ({pendingItems.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {pendingItems.map((item) => (
                      <QueueItemCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* Completed */}
            {completedItems.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-medium text-zinc-400">
                  Completed ({completedItems.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {completedItems.map((item) => (
                      <QueueItemCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* Failed */}
            {failedItems.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-medium text-zinc-400">
                  Failed ({failedItems.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {failedItems.map((item) => (
                      <QueueItemCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
