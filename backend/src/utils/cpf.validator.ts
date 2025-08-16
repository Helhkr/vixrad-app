export function validateCpf(cpf: string): boolean {
  if (!cpf) return false;

  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  const CpfNumbers = cpf.split('').map(el => +el);

  const rest = (count: number): number => {
    return (
      (CpfNumbers.slice(0, count - 1).reduce((sum, el, index) => sum + el * (count - index), 0) * 10) % 11
    ) % 10;
  };

  return rest(10) === CpfNumbers[9] && rest(11) === CpfNumbers[10];
}
