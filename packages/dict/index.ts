export const dictTranslate = (val: string | number | null, opts: Record<string, any>[], [labelKey, valueKey]: string[] = ['label', 'value']) => {
    const matcher = opts.find((item) => item[valueKey] === val)
    return matcher ? matcher[labelKey] : val
}