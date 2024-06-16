import re

# example for equation: "=E7*100000/H7"
print("example for equation:\n=E7*100000/H7")
f=open("equations.txt",'r');
for line in f.readlines():
    excel_equation = line.strip()

    # this removes the row number
    excel_equation = re.sub(r'([a-zA-Z])+[0-9]+', r'\1', excel_equation)

    # replaces the column from excel with an array access
    excel_equation = re.sub(r'([a-zA-Z]+)', lambda match:f'm[{ord(match.group(0).upper()) - ord("B")}]', excel_equation)

    print(excel_equation)
