/**
 * Print builder state: select, clear, restore, counter, and first-visible.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createPrintSandbox } = require('./helpers/mock-dom');

const SLUGS = ['rov-hil-testbench', 'rov-buoyancy-float', 'ml-dueling'];
const plain = (value) => JSON.parse(JSON.stringify(value));

describe('Print builder controller', () => {
  it('should default to all projects selected and mark the first visible one', () => {
    const { instance, counter, storage, sections } = createPrintSandbox();

    assert.deepStrictEqual(plain(instance.getState()), {
      selected: 3,
      total: 3,
      slugs: SLUGS,
      firstVisible: 'rov-hil-testbench',
      excluded: 0
    });
    assert.strictEqual(counter.textContent, '3 of 3 Selected');
    assert.ok(!counter.classList.contains('none-selected'));
    assert.ok(sections['rov-hil-testbench'].classList.contains('is-first-visible'));
    assert.strictEqual(storage.getItem('pdf_selected_projects'), JSON.stringify(SLUGS));
  });

  it('should clear every selection and persist an intentionally empty array', () => {
    const { instance, counter, storage, checkboxes, cards, sections } = createPrintSandbox();

    instance.clearAll();

    assert.deepStrictEqual(plain(instance.getState()), {
      selected: 0,
      total: 3,
      slugs: [],
      firstVisible: null,
      excluded: 3
    });
    assert.strictEqual(counter.textContent, '0 of 3 Selected');
    assert.ok(counter.classList.contains('none-selected'));
    assert.strictEqual(storage.getItem('pdf_selected_projects'), '[]');
    SLUGS.forEach((slug) => {
      assert.strictEqual(checkboxes[slug].checked, false);
      assert.ok(cards[slug].classList.contains('selected') === false);
      assert.ok(sections[slug].classList.contains('is-excluded'));
      assert.ok(sections[slug].classList.contains('is-first-visible') === false);
    });
  });

  it('should restore select all after clearing', () => {
    const { instance, counter, sections } = createPrintSandbox();

    instance.clearAll();
    instance.selectAll();

    assert.strictEqual(instance.getState().selected, 3);
    assert.deepStrictEqual(plain(instance.getState().slugs), SLUGS);
    assert.strictEqual(instance.getState().firstVisible, 'rov-hil-testbench');
    assert.strictEqual(counter.textContent, '3 of 3 Selected');
    assert.ok(!counter.classList.contains('none-selected'));
    SLUGS.forEach((slug) => {
      assert.ok(!sections[slug].classList.contains('is-excluded'));
    });
  });

  it('should restore an empty saved selection without falling back to all', () => {
    const { instance, checkboxes, counter } = createPrintSandbox({ saved: [] });

    assert.strictEqual(instance.getState().selected, 0);
    assert.deepStrictEqual(plain(instance.getState().slugs), []);
    assert.strictEqual(instance.getState().firstVisible, null);
    assert.strictEqual(counter.textContent, '0 of 3 Selected');
    SLUGS.forEach((slug) => assert.strictEqual(checkboxes[slug].checked, false));
  });

  it('should restore a saved subset and start pagination at the first visible project', () => {
    const { instance, checkboxes, sections, counter } = createPrintSandbox({
      saved: ['ml-dueling']
    });

    assert.deepStrictEqual(plain(instance.getState()), {
      selected: 1,
      total: 3,
      slugs: ['ml-dueling'],
      firstVisible: 'ml-dueling',
      excluded: 2
    });
    assert.strictEqual(counter.textContent, '1 of 3 Selected');
    assert.strictEqual(checkboxes['ml-dueling'].checked, true);
    assert.strictEqual(checkboxes['rov-hil-testbench'].checked, false);
    assert.ok(sections['rov-hil-testbench'].classList.contains('is-excluded'));
    assert.ok(sections['ml-dueling'].classList.contains('is-first-visible'));
  });

  it('should ignore malformed saved state and keep the default selection', () => {
    const { instance, storage } = createPrintSandbox();
    storage.store.pdf_selected_projects = '{not valid json';

    const restored = instance.restore();

    assert.strictEqual(restored.selected, 3);
    assert.deepStrictEqual(plain(restored.slugs), SLUGS);
    assert.strictEqual(storage.getItem('pdf_selected_projects'), JSON.stringify(SLUGS));
  });

  it('should update the counter and persistence when a checkbox changes', () => {
    const { instance, checkboxes, counter, storage } = createPrintSandbox();
    const checkbox = checkboxes['rov-buoyancy-float'];

    checkbox.checked = false;
    checkbox.dispatchEvent({ type: 'change' });

    assert.strictEqual(instance.getState().selected, 2);
    assert.deepStrictEqual(plain(instance.getState().slugs), ['rov-hil-testbench', 'ml-dueling']);
    assert.strictEqual(counter.textContent, '2 of 3 Selected');
    assert.strictEqual(
      storage.getItem('pdf_selected_projects'),
      JSON.stringify(['rov-hil-testbench', 'ml-dueling'])
    );
  });
});
