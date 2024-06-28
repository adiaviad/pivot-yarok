
with open("names.txt",'rb') as f:
    encoded_data =f.read()
    decoded=encoded_data.decode("UTF8")
    print(decoded)
    result=""
    for name in decoded.split("\n"):
        name= name.replace('(', ' b').replace(')', 'B ').replace('d',"-").replace('_', ' ')
        print(name)
        result+=name
    with open("results.txt",'wb') as out:
        out.write(result.encode("UTF-16"))
