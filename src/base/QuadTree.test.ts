import { Rect } from 'base/math';
import { QuadTree } from './QuadTree';

interface TestData {
  id: string;
  rect: Rect;
}

describe('QuadTree', () => {
  let root: QuadTree<TestData>;

  beforeEach(() => {
    root = new QuadTree<TestData>(Rect.of(0, 0, 1000, 1000), data => data.rect);
  });

  test('insert, delete and find in', () => {
    const itemQ1 = { id: 'q1', rect: Rect.of(600, 400, 20, 20) };
    const itemQ2 = { id: 'q2', rect: Rect.of(200, 200, 20, 20) };
    const itemQ3 = { id: 'q3', rect: Rect.of(200, 900, 20, 20) };
    const itemQ4 = { id: 'q4', rect: Rect.of(700, 800, 20, 20) };
    root.insert(itemQ1);
    root.insert(itemQ2);
    root.insert(itemQ3);
    root.insert(itemQ4);

    let inQ1 = root.findIn(Rect.of(500, 0, 500, 500));
    let inQ2 = root.findIn(Rect.of(0, 0, 500, 500));
    let inQ3 = root.findIn(Rect.of(0, 500, 500, 500));
    let inQ4 = root.findIn(Rect.of(500, 500, 500, 500));

    expect(inQ1.size).toBe(1);
    expect(inQ1.has(itemQ1)).toBeTruthy();
    expect(inQ2.size).toBe(1);
    expect(inQ2.has(itemQ2)).toBeTruthy();
    expect(inQ3.size).toBe(1);
    expect(inQ3.has(itemQ3)).toBeTruthy();
    expect(inQ4.size).toBe(1);
    expect(inQ4.has(itemQ4)).toBeTruthy();
    expect(root.hasChildren).toBeFalsy();

    const itemAll = { id: 'all', rect: Rect.of(490, 490, 20, 20) };
    root.insert(itemAll);

    inQ1 = root.findIn(Rect.of(500, 0, 500, 500));
    inQ2 = root.findIn(Rect.of(0, 0, 500, 500));
    inQ3 = root.findIn(Rect.of(0, 500, 500, 500));
    inQ4 = root.findIn(Rect.of(500, 500, 500, 500));

    expect(inQ1.size).toBe(2);
    expect(inQ1.has(itemQ1)).toBeTruthy();
    expect(inQ1.has(itemAll)).toBeTruthy();
    expect(inQ2.size).toBe(2);
    expect(inQ2.has(itemQ2)).toBeTruthy();
    expect(inQ2.has(itemAll)).toBeTruthy();
    expect(inQ3.size).toBe(2);
    expect(inQ3.has(itemQ3)).toBeTruthy();
    expect(inQ3.has(itemAll)).toBeTruthy();
    expect(inQ4.size).toBe(2);
    expect(inQ4.has(itemQ4)).toBeTruthy();
    expect(inQ4.has(itemAll)).toBeTruthy();

    // after insert item all, count of values reachs maximum and split into 4 quadrants
    expect(root.hasChildren).toBeTruthy();

    const nodes = root.findNodes(itemQ1);
    expect(nodes.size).toBe(1);

    root.delete(itemAll);

    // after delete, count of item reduce to 4 and children have been merged
    expect(root.hasChildren).toBeFalsy();
  });
});
