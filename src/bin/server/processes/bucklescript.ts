import Session from "../session";

export default class BuckleScript {
  constructor(private readonly session: Session) {
  }

  public run(): Promise<string> {
    let buffer = "";
    return new Promise((resolve) => {
      const command = this.session.settings.reason.path.bsb;
      const args = [
        "-make-world",
      ];
      const process = this.session.environment.spawn(command, args);

      process.on("error", (error: Error & { code: string }) => {
        if (error.code === "ENOENT") {
          const msg = `Cannot find bsb binary at "${command}".`;
          this.session.connection.window.showWarningMessage(msg);
          this.session.connection.window.showWarningMessage(`Double check your path or try configuring "reason.path.bsb" under "User Settings". Alternatively, disable "bsb" in "reason.diagnostics.tools"`);
        }
        resolve("");
      });
      process.stdout.on("data", (data: Buffer | string) => buffer += data.toString());
      process.stdout.on("end", () => resolve(buffer));
    });
  }
}
