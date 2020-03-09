import { Service } from 'typedi';
import { Subject } from 'rxjs';
import { Project } from 'gaudi';
import { noop } from 'base/function';
import { ScopeService } from 'editor/scope/ScopeService';
import { HistoryService } from 'editor/HistoryService';

interface OpenedEvent {
  scopeNames: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CloseEvent {}

@Service()
export class ProjectService {
  get opened$() {
    return this.opened.asObservable();
  }

  get closed$() {
    return this.closed.asObservable();
  }

  private opened = new Subject<OpenedEvent>();

  private closed = new Subject<CloseEvent>();

  constructor(private scope: ScopeService, private history: HistoryService) {}

  setCurrent(project: Project) {
    const scopeNames: string[] = [];
    for (const scopeName in project.blueprints) {
      scopeNames.push(scopeName);
      this.scope.create(scopeName, project.blueprints[scopeName]);
    }

    this.history.reset();
    // just for display
    this.history.push({
      label: 'Open project',
      do: noop,
      undo: () => {
        throw new Error('cannot undo this command');
      },
      undoable: true,
    });

    this.opened.next({ scopeNames });
  }

  getCurrent() {
    const project: Project = {
      blueprints: this.scope.extractAll(),
      entry: this.scope.getEntry(),
      metadata: {
        plugins: [],
        version: '',
      },
      data: {},
    };

    return project;
  }
}
