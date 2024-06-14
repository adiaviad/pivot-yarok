const resHierarchy = {
    "resources": [
        {
            "value": "PlanAndDev",
            "name": "משאב על פיתוח ותכנון",
            "supermeasures": [
                {
                    name: "מדד על תכנון",
                    value: "plan"
                },
                {
                    name: "מדד על פיתוח",
                    value: "dev"
                }
            ]
        }
    ]
}
const resourceNaming = {
    PlanAndDev: {
        name: "משאב על פיתוח ותכנון",
        value: "PlanAndDev",
        plan: {
            name: "מדד על תכנון",
            value: "plan"
        },
        dev: {
            name: "מדד על פיתוח",
            value: "dev"
        }
    },
}
//the column names are only used when previewing the data so just generate ghraphics and then copy the array of names (in the log from the generareSuperMeasureSubTable fucntion)
const measureNaming = {
    plan: {
        name: "מדד על תכנון",
        value: "plan",
        columns_names: 
        ["קיום תכנית מתאר כוללת לרשות המקומית","יחידה לתכנון אסטרטגי","מספר העובדים בתכנון ובנייה ל-10000 נפש","ההוצאה בפועל על תכנון ובניין עיר לתושב","שם רשות"]

    },
    dev: {
        name: "מדד על פיתוח",
        value: "dev",
        columns_names:
        ["שטח לכלל השימושים (מטר רבוע ל-1000 תושבים) תחילת בניה","מגורים (דירות ל-1000 תושבים) תחילת בניה","שטח לכלל השימושים (מטר רבוע ל-1000 תושבים) גמר בניה","מגורים (דירות ל-1000 תושבים) גמר בניה","תקציב בלתי רגיל לנפש","שם רשות"]
        
    }
}
