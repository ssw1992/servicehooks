import { useTimeTangeComputed, useMultipleSelectStrComputed } from '@packages/computed';
import { ref, nextTick } from 'vue';
import { expect, test } from 'vitest';

test('useTimeTangeComputed get and set', async () => {
    const obj = ref<Record<string, any>>({});
    const comp = useTimeTangeComputed(obj as any);

    // initial: no start/end -> empty array
    expect(comp.value).toEqual([]);

    // when underlying values present -> returns the pair
    obj.value.startTime = '2025-01-01';
    obj.value.endTime = '2025-01-02';
    await nextTick();
    expect(comp.value).toEqual(['2025-01-01', '2025-01-02']);

    // setting computed should update source
    comp.value = ['A', 'B'];
    await nextTick();
    expect(obj.value.startTime).toBe('A');
    expect(obj.value.endTime).toBe('B');
});

test('useMultipleSelectStrComputed get and set with defaults and custom split', async () => {
    // default split ","
    const obj = ref({ tags: 'a,b' });
    const comp = useMultipleSelectStrComputed(obj as any, 'tags');
    expect(comp.value).toEqual(['a', 'b']);

    comp.value = ['x', 'y'];
    await nextTick();
    expect(obj.value.tags).toBe('x,y');

    // missing key -> get returns [] and set produces empty string
    const obj2 = ref<Record<string, any>>({});
    const comp2 = useMultipleSelectStrComputed(obj2 as any, 'missing');
    expect(comp2.value).toEqual([]);
    comp2.value = [];
    await nextTick();
    expect(obj2.value.missing).toBe('');

    // custom split sign
    const obj3 = ref({ items: 'one;two' });
    const comp3 = useMultipleSelectStrComputed(obj3 as any, 'items', ';');
    expect(comp3.value).toEqual(['one', 'two']);
    comp3.value = ['uno', 'dos'];
    await nextTick();
    expect(obj3.value.items).toBe('uno;dos');
});
