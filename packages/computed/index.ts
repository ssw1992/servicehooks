import { computed, Ref } from "vue";

export const useTimeTangeComputed = (refObj: Ref<Record<string, any>>, [startTimeKey, endTimeKey] = ['startTime', 'endTime']) => {
    return computed({
        get() {
            if (refObj.value[startTimeKey] && refObj.value[endTimeKey]) {
                return [refObj.value[startTimeKey], refObj.value[endTimeKey]];
            }
            return []
        },
        set(val) {
            [refObj.value[startTimeKey], refObj.value[endTimeKey]] = val
        }
    })

}


export const useMultipleSelectStrComputed = (refObj: Ref<Record<string, any>>, key: string, splitSign = ',') => {
    return computed({
        get() {
            if (refObj.value[key]) {
                return refObj.value[key].split(splitSign);
            }
            return []
        },
        set(val) {
            refObj.value[key] = val.join(splitSign);
        }
    })

}
