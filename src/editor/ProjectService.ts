import { Service } from 'typedi';
import { Project, Blueprint } from 'gaudi';
import { BlueprintService } from 'editor/BlueprintService';
import { HistoryService } from 'editor/HistoryService';
import { Subject } from 'rxjs';

interface ProjectOpenedEvent {
  type: 'project-opened';
  project: Project;
}

interface ProjectCloseEvent {
  type: 'project-closed';
  project: Project;
}

export type ProjectEvent = ProjectOpenedEvent | ProjectCloseEvent;

@Service()
export class ProjectService {
  get event$() {
    return this.event.asObservable();
  }

  private current: Project | null = null;

  private event = new Subject<ProjectEvent>();

  constructor(private blueprint: BlueprintService, private history: HistoryService) {}

  setCurrent(project: Project) {
    this.current = project;

    for (const name in project.blueprints) {
      this.blueprint.import(name, project.blueprints[name]);
    }

    this.history.reset();
    this.history.push({
      label: 'Open project',
      do: () => this.blueprint.setEntry(project.entry),
      undo: () => {
        throw new Error('cannot undo this command');
      },
      undoable: true,
    });

    this.event.next({ type: 'project-opened', project: this.getCurrent() });
  }

  getCurrent() {
    if (!this.current) throw new Error();

    const scopes = this.blueprint.getScopes();
    const blueprints: Record<string, Blueprint> = {};

    for (const scope of scopes) {
      blueprints[scope] = this.blueprint.getRoot(scope)!;
    }

    const project: Project = {
      ...this.current,
      blueprints,
    };

    return project;
  }
}
