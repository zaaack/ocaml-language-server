import URI from "vscode-uri";
import { Host } from "./host";

export class Resource {
  public static from(source: Host, uri: URI): Resource {
    return new this(source, uri);
  }
  protected constructor(readonly source: Host, readonly uri: URI) { }
  public into(target: Host, skipEncoding: boolean = true): URI {
    switch (target) {
      case Host.Native:
        return this.readNative(skipEncoding);
      case Host.WSL:
        return this.readWSL(skipEncoding);
    }
  }
  protected readNative(skipEncoding: boolean): URI {
    switch (this.source) {
      case Host.Native:
        return this.uri;
      case Host.WSL:
        const uri = this.uri.toString(skipEncoding);
        // FIXME: move this check somewhere earlier and do it only once
        const localappdata = process.env.localappdata;
        if (null == localappdata) throw new Error("LOCALAPPDATA must be set in environment to interpret WSL /home");
        let match: RegExpMatchArray | null = null;
        // rewrite /mnt/…
        if (match = uri.match(/^file:\/\/\/mnt\/([a-zA-Z])\/(.*)$/)) {
          match.shift();
          const drive = match.shift() as string;
          const  rest = match.shift() as string;
          return URI.parse(`file:///${drive}:/${rest}`);
        }
        // rewrite /home/…
        if (match = uri.match(/^file:\/\/\/home\/(.+)$/)) {
          match.shift();
          const rest = match.shift() as string;
          return URI.parse(`${URI.file(localappdata).toString(skipEncoding)}/lxss/home/${rest}`);
        }
        return this.uri;
    }
  }
  protected readWSL(skipEncoding: boolean): URI {
    switch (this.source) {
      case Host.Native:
        const uri = this.uri.toString(skipEncoding);
        let match: RegExpMatchArray | null = null;
        if (match = uri.match(/^file:\/\/\/([a-zA-Z]):\//)) {
          match.shift();
          const drive = match.shift() as string;
          return URI.parse(`file:///mnt/${drive}/`);
        }
        return this.uri;
      case Host.WSL:
        return this.uri;
    }
  }
}
