/**
 * 多个值存为字符串的切割符号
 */
export const VALUE_SPLIT_SIGN = ','


export const dictTranslate = (val: string | number | null, opts: Record<string | number, any>[], [labelKey, valueKey]: (string | number)[] = ['label', 'value']) => {
    const matcher = opts.find((item) => item[valueKey] === val)
    return matcher ? matcher[labelKey] : val
}


export const dictTranslateValues = (vals: string | null, opts: Record<string | number, any>[], [labelKey, valueKey]: (string | number)[] = ['label', 'value']) => {
    return vals && vals.split(VALUE_SPLIT_SIGN).map((code: string) => dictTranslate(code, opts, [labelKey, valueKey])).join(VALUE_SPLIT_SIGN)
}