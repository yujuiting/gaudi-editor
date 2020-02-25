import { Service } from 'typedi';
import { Project, Blueprint } from 'gaudi';
import { BlueprintService } from 'editor/BlueprintService';
import { HistoryService } from 'editor/HistoryService';

@Service()
export class ProjectService {
  private current: Project | null = null;

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
    });
  }

  getCurrent() {
    if (!this.current) throw new Error();

    const rootNames = this.blueprint.getRootNames();
    const blueprints: Record<string, Blueprint> = {};

    for (const rootName of rootNames) {
      blueprints[rootName] = this.blueprint.getRoot(rootName)!;
    }

    const project: Project = {
      ...this.current,
      blueprints,
    };

    return project;
  }
}
