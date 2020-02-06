import { Service } from 'typedi';
import { distinct } from 'rxjs/operators';
import { KeyboardService } from './KeyboardService';
import * as array from './array';

export interface Keybinding {
  id: string;
  parts: string[];
  onEnter?: () => void;
  onLeave?: () => void;
}

@Service()
export class KeybindingService {
  private keybindings = new Array<Keybinding>();

  private current: Keybinding | null = null;

  private buffer: string[] = [];

  constructor(keyboardService: KeyboardService) {
    keyboardService.keydown$
      // prevent fire same key repeatly and reset after key up
      .pipe(distinct(e => e.code, keyboardService.keyup$))
      .subscribe(e => this.pushBuffer(e.code));

    keyboardService.keyup$.subscribe(() => this.clearBuffer());
  }

  define(keybinding: Keybinding) {
    this.keybindings.push(keybinding);
  }

  private pushBuffer(code: string) {
    this.buffer.push(code);
    for (const keybinding of this.keybindings) {
      if (array.shallowEqual(keybinding.parts, this.buffer)) {
        this.setCurrent(keybinding);
        return;
      }
    }
  }

  private clearBuffer() {
    this.buffer = [];
    this.setCurrent(null);
  }

  private setCurrent(current: Keybinding | null) {
    if (current) {
      if (current.onEnter) {
        current.onEnter();
      }
    } else if (this.current) {
      if (this.current.onLeave) {
        this.current.onLeave();
      }
    }

    this.current = current;
  }
}
