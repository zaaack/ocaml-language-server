import { merlin } from "../../../lib";
import Session from "../session";

export default async function(session: Session): Promise<void> {
  await session.merlin.restart();
  // // FIXME: put this in a method after refactoring Synchronizer
  for (const document of session.synchronizer.documents.values()) {
    const content = document.getText();
    const request = merlin.Sync.tell("start", "end", content);
    await session.merlin.sync(request, document, Infinity);
    const tools: Set<string> = new Set(
      session.settings.reason.diagnostics.tools,
    );
    if (!tools.has("bsb")) {
      await session.analyzer.refreshImmediate(document);
    }
    await session.indexer.populate(document);
  }
}
