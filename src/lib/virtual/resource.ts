import URI from "vscode-uri";
import { Host } from "./host";

export class Resource {
  public static from(source: Host, uri: URI): Resource {
    return new this(source, uri);
  }
  protected constructor(readonly source: Host, readonly uri: URI) { }
  public into(target: Host): URI {
    switch (target) {
      case Host.Native:
        return this.readNative();
      case Host.WSL:
        return this.readWSL();
    }
  }
  protected readNative(): URI {
    switch (this.source) {
      case Host.Native:
        return this.uri;
      case Host.WSL:
        const searcher = /^file:\/\/\/mnt\/([a-zA-Z])\//;
        const replacer = (_: string, drive: string) => `file:///${drive}:/`;
        const skipEncoding = true;
        return URI.parse(this.uri.toString(skipEncoding).replace(searcher, replacer));
    }
  }
  protected readWSL(): URI {
    switch (this.source) {
      case Host.Native:
        const searcher = /^file:\/\/\/([a-zA-Z]):\//;
        const replacer = (_: string, drive: string) => `file:///mnt/${drive}/`;
        const skipEncoding = true;
        return URI.parse(this.uri.toString(skipEncoding).replace(searcher, replacer));
      case Host.WSL:
        return this.uri;
    }
  }
}
