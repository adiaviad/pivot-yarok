import re


def excelColumnToIndex(string):
    s = 0
    base = ord("Z") - ord("A") + 1
    string = string[::-1]
    for i in range(len(string)):
        current = ord(string[i].upper()) - ord("A") + 1
        s += current * (base ** i)
    return s - 2


# example for equation: "=E7*100000/H7"
print("example for equation:\n=E7*100000/H7")

result=""
with open("equations.txt", 'r') as f:
    for line in f.readlines():
        excel_equation = line.strip()

        # this removes the row number
        excel_equation = re.sub(r'([a-zA-Z])+[0-9]+', r'\1', excel_equation)

        # replaces the column from excel with an array access
        excel_equation = re.sub(r'([a-zA-Z]+)', lambda match: f'm[{excelColumnToIndex(match.group(0).upper())}]',
                                excel_equation)

        print(excel_equation)
        result+=f'{excel_equation}\n'
    with open("results.txt",'w') as out:
        out.write(result)