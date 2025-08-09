export const dictTranslate = (val: string | number | null, opts: Record<string | number, any>[], [labelKey, valueKey]: (string | number)[] = ['label', 'value']) => {
    const matcher = opts.find((item) => item[valueKey] === val)
    return matcher ? matcher[labelKey] : val
}