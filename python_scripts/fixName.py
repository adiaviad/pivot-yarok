names=[
    "שטח לכלל השימושים (מטר רבוע ל-1000 תושבים) גמר בניה",
]
for name in names:
    name= name.replace('(', ' b').replace(')', 'B ').replace('d',"-").replace('_', ' ')
    print(name)
