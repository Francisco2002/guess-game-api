export const sanitizeStr = (str: string): string => {
    return str.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}