import server from "vscode-languageserver";
import Session from "../session";

export default function (_: Session): server.NotificationHandler0 {
  return () => {
    // session.dispose();
  };
}
