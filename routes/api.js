const { ColorTransformCollection } = require('devexpress-richedit/lib/core/model/drawing/transform/color-transform-collection');
const { EditCommandRequest } = require('devexpress-richedit/lib/core/model/json/command-request');
var express = require('express');
var router = express.Router();
const mssql = require('mssql');
/* GET home page. */

const config = {
            // "user"      : "sa",
            // "password"  : "qw12qw12)",
            // "server"    : "192.168.0.122",
            // "port"      : 1433,
            // "database"  : "aTEST",
            // "timezone"  : 'utc',
            // "options"   : {
            //     "encrypt" : false
            // }
        "user"      : "test",
        //"user"      : "sa",
        "password"  : "qw12qw12",
        "server"    : "192.168.35.17",
        //"server"    : "192.168.0.181",
        // "server"    : "192.168.0.135",
        "port"      : 1433,
        "database"  : "aTEST",
        // "timezone"  : 'utc',
        "options"   : {
            encrypt: false, // Use this if you're on Windows Azure 
            enableArithAbort: true
         }
}

// function convert(array){
//     var map = {};
//     if(array != null && array.length > 0) {

//         for(var i = 0; i < array.length; i++){
//             var obj = array[i];
//             obj.children= [];

//             // 자기 자신 설정
//             map[obj.BMTR_Grp_ID, obj.BM_LoIDs] = obj;


//             // 상위 찾기
//             var parent = obj.BM_UpIDs || '-';

//             console.log("grp : " + obj.BMTR_Grp_ID);
//             console.log("parent : " + parent);

//             if(!map[obj.BMTR_Grp_ID, parent]){
//                 console.log("map false");

//                 map[obj.BMTR_Grp_ID, parent] = {
//                     children: []
//                 };
//             } else {
//                 console.log("map true");
//             }

//             map[obj.BMTR_Grp_ID, parent].children.push(obj);
//         }

//         return map['-'].children;
//     } else {
//         return map;
//     }
// }

function GetTree(list) {
    var map = {}, node, roots = [], i;
    
    console.log("list_to_tree");

    for (i = 0; i < list.length; i++) {
      map[i] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    // list는 처음부터 있는거로 다른데로 갈 수 도 있다....
    
    for (i = 0; i < list.length; i++) {
      node = list[i];
      if (node.BM_UpIDs != "0") {
        console.log(" NOT ZERO : " + node.BM_UpIDs + ":" + node.BM_LoIDs);
        // if you have dangling branches check that map[node.parentId] exists
        // 중복 체크 해볼 것
        // 들어가진다.
        
        // 0이 아닌데 들어갈 곳이 없는 경우

        // 순서대로 안나옴....

        var isAdd = false;

        // 속도 개선을 위해 MAX를 i 값으로 지정
        // 첫글은 무조건 추가되어야 한다.

        for(j=0; j<i; j++) {
            if(node.BM_UpIDs == list[j].BM_LoIDs) {
                // 무조건 아래가 0이면 안됨...
                // 다른게 이미 들어왔을수도 있으므로
                // 그럼 또 아래를 조사한다.
                
                var isDuple = false;

                for(k=0; k<list[j].children.length; k++) {
                    if(list[j].children[k].BM_LoIDs == node.BM_LoIDs) {
                        isDuple = true;
                        break;
                    } else {}
                }

                // 저대로 하게되면 -> 순서대로 나온다면
                // i값 j 값도 확인해야 함
                // 무조건 종속되는 경우는 밑으로 가는 경우임

                if(!isDuple && i > j ) {
                    console.log("Add Child");
                    list[j].children.push(node);
                    isAdd = true;
                    break;
                } else {}
                
            } else {}

            // 끝났는데 저장할 곳이 없으면
            // root 로 넣어준다.
        }
        
        if(!isAdd) {
            console.log("Add Root");
            roots.push(node);
        } else {}

      } else {
        roots.push(node);
      }
    }

    return roots;
}

// 일반적으로 사용하는 쿼리 사용 방법/
router.post('/callData', function(req, res, next) {
    try {

        console.log('callData');

        mssql.connect(config, function (err) {

            console.log('Connect');
            var request = new mssql.Request();

            var queryString = "EXEC p_BMTR " + req.body.pPage + ", " + req.body.pPageCount;

            request.query(queryString, function (err, result) {
        

                var returnData = GetTree(result.recordset);

                console.log(JSON.stringify(returnData));

                res.json({data : returnData} );
                //console.log(recordset.recordset)
                //res.render()
            });
        
        
            

            // request.input('p_Parameter', sql.NVARCHAR(sql.MAX), '|||ExecTy       ===gvvA|||E_IDs        ===E0000001|||asas         ===  |||');
        
            // request.execute('p__PT_FA', function (err, recordsets, returnValue) {

            //     res.json(
            //         { data : recordsets }
            //     );
            // });
        });
    } catch (err) {
        alert(err);
        //console.log('error fire')
    }
    // res.render('index', { title: 'Express' });

});

router.get('/getRowCount', function(req, res, next) {
    try {

        console.log('getRowCount');

        mssql.connect(config, function (err) {

            console.log('Connect');
            var request = new mssql.Request();

            var queryString = "WITH c ( " 
                                + "c_Grp_M_IDs"
                                + ", c_BM_UpIDs"
                                + ", c_BM_LoIDs"
                                + ", c_Lv"
                                + ", c_D_ID"
                                + ", c_Sort_BM_IDs"
                                + ", c_BM_Seq "
                                + ") "
                                + "AS "
                                + "( "
                                + "SELECT " 
                                + "BM_LoIDs    grpM_IDs"
                                + ", BM_UpIDs"
                                + ", BM_LoIDs"
                                + ", 0           Lv"
                                + ", BM_D_ID"
                                + ", '_' + REPLICATE('0', 5  - LEN(1000 - BM_Seq)) + CAST((1000 - BM_Seq) AS VARCHAR(255))   Sort_BM_IDs"
                                + ", BM_Seq "
                                + "FROM tBM "
                                + "WHERE BM_UpIDs = 0 "

                                + "UNION ALL "

                                + "SELECT "
                                + "c_Grp_M_IDs"
                                + ", BM_UpIDs"
                                + ", BM_LoIDs"
                                + ", c_Lv + 1"
                                + ", BM_D_ID"
                                + ", c_Sort_BM_IDs   + '_' + REPLICATE('0', 5  - LEN(1000 - BM_Seq)) + CAST((1000 - BM_Seq) AS VARCHAR(255)) Sort_BM_IDs"
                                + ", BM_Seq "
                                + "FROM tBM "
                                + "INNER JOIN c  ON c_BM_LoIDs = BM_UpIDs "
                                + ") "
                                + "SELECT COUNT(*) bmCnt FROM ( "
                                + "SELECT "
                                + "ROW_NUMBER() OVER(ORDER BY c_Sort_BM_IDs ) AS rownum, "
                                + "c_BM_UpIDs BM_UpIDs"
                                + ", c_BM_LoIDs BM_LoIDs"
                                + ", c_Sort_BM_IDs BMTR_Order"
                                + ", c_BM_Seq"
                                + ", REPLICATE('ㅤ', c_Lv) + D_Title D_Title"
                                + ", D_cNm"
                                + ", c_Grp_M_IDs BMTR_Grp_ID"
                                + ", c_Lv BMTR_lv"
                                + ", c_D_ID D_ID"
                                + ", c_BM_Seq BMTR_Seq "
                                + "FROM c "
                                + "INNER JOIN tD ON D_ID = c_D_ID "
                                + ") tBM"

            request.query(queryString, function (err, result) {
        

                var returnData = GetTree(result.recordset);

                console.log(JSON.stringify(returnData));

                res.json({data : returnData} );
                //console.log(recordset.recordset)
                //res.render()
            });
        });
    } catch (err) {
        alert(err);
    }
});

router.post('/addData', function(req, res, next) {
    try {

        console.log('addData');

        mssql.connect(config, function (err) {

            console.log('Connect');
            var request = new mssql.Request();

            console.log(req.body);
            var queryString = "Exec p_D_N '" + req.body.pTitle + "','" + req.body.pName + "'," + req.body.pUpIDs + ", '" + req.body.pContents + "';";

            if(req.body.pUpIDs != 0) {
                queryString = "Exec p_D_UD '" + req.body.pTitle + "','" + req.body.pName + "'," + req.body.pUpIDs + ", '" + req.body.pContents + "';";
            } else {}
            // 
            
            console.log(queryString);


            request.query(queryString, function (err, recordset) {
        
                //console.log(recordset.recordset)
                //res.render()
                
                res.json({data : 'OK'} );
            });
        
        
            

            // request.input('p_Parameter', sql.NVARCHAR(sql.MAX), '|||ExecTy       ===gvvA|||E_IDs        ===E0000001|||asas         ===  |||');
        
            // request.execute('p__PT_FA', function (err, recordsets, returnValue) {

            //     res.json(
            //         { data : recordsets }
            //     );
            // });
        });
    } catch (err) {
        alert(err);
        //console.log('error fire')
    }
    // res.render('index', { title: 'Express' });

});



// await pool 방식
router.post('/updateData', async function(req, res, next) {
    try {

        console.log('updateData');

        let pool = await mssql.connect(config)

        console.log(req.body);

        var queryString = "Exec p_BM_MV_UD " + req.body.pUpIDs + "," + req.body.pBmID + ";";

        //console.log(JSON.parse(req.body.data));

        //var updateObj = JSON.parse(req.body.data);

        // var queryString = "";

        // for(i=0; i<updateObj.length; i++) {
        //     // var selectQueryString = "SELECT * FROM tBM WHERE BM_i = " + updateObj[i].BM_i;

        //     // console.log("Query : " + selectQueryString);
        //     // //res.render()
        //     // let result = await pool.query(selectQueryString)
        //     //     console.log('I : :', i);
        //     //     console.log("BM_i : " + result.recordset[0].BM_i);
        //     //     console.log("BM_UpIDs : " + result.recordset[0].BM_UpIDs);
        //     //     console.log("BM_LoIDs : " + result.recordset[0].BM_LoIDs);
        //     //     console.log("org up : " + updateObj[i].orgUpIDs);
        //     //     console.log("org lo : " + updateObj[i].orgLoIDs);

        //     // if(result.recordset[0].BM_UpIDs == updateObj[i].orgUpIDs && result.recordset[0].BM_LoIDs == updateObj[i].orgLoIDs) {
        //     //     queryString += "UPDATE tBM SET BM_UpIDs = " + updateObj[i].BM_UpIDs + ", BM_LoIDs = " + updateObj[i].BM_LoIDs 
        //     //     queryString += " WHERE BM_i = " + updateObj[i].BM_i
        //     //     queryString += ";";
        //     //     console.log('queryString :', queryString);
        //     // } else {
        //     //     console.log("Data Compare Error");
        //     //     res.json({data : 'Error'} );
        //     //     return;
        //     // }
        // }

        // // 0 lv로 무언가가 변경된 경우 0 lv 전체를 Refresh 해야하는 상황이 온다.
        // // 그러면 0 레벨일때는 다른걸 삭제하면 안된다.

        // // 단 0레벨이 아니면 해당 Grp의 글을 전부 지워줘야 한다.
        // // 다른것의 밑이었다가 최상위가 되는 경우 -> 다른 Grp를 건드릴 필요없음

        // // 즉 0인부분은 BOM 타지 않고 0인 애들만 수정해야 한다.
        // queryString += "Exec p_BMTR_U ";

        // if(updateObj[0].BM_UpIDs != 0) {
        //     queryString += updateObj[0].BMTR_Grp_ID;
        // } else {}
        
        console.log(queryString);

        pool.query(queryString, function (err, recordset) {
            res.json({data : 'OK'} );
        });

        
    } catch (err) {
        // alert(err);
        console.log('error fire',err)
    }
    // res.render('index', { title: 'Express' });

});

router.post('/shareData', async function(req, res, next) {
    try {

        console.log('shareData');

        let pool = await mssql.connect(config)

        console.log(req.body);
        //console.log(JSON.parse(req.body.data));

        var queryString = "Exec p_BM_SH " + req.body.pUpIDs + "," + req.body.pBmID + "," + req.body.pDID + ";";

        // queryString += "Exec p_BMTR_U ";
        // queryString += req.body.pGrpID;

        console.log(queryString);
        
        pool.query(queryString, function (err, recordset) {
            res.json({data : 'OK'} );
        });

        
    } catch (err) {
        // alert(err);
        console.log('error fire',err)
    }
    // res.render('index', { title: 'Express' });

});

router.post('/updateContents', async function(req, res, next) {
    try {
        console.log("updateContents");

        let pool = await mssql.connect(config);

        var queryString = "UPDATE tD Set D_Con = '" + req.body.pContents + "' WHERE D_ID = " + req.body.pDId;

        console.log(queryString);

        pool.query(queryString, function (err, recordset) {
            res.json({data : 'OK'} );
        });

    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
    // res.render('index', { title: 'Express' });

});


router.get('/getContents', function(req, res, next) {
    try {

        mssql.connect(config, function (err) {
            var request = new mssql.Request();

            console.log(req.query.DId);

            var queryString = 
            "SELECT * FROM tD WHERE D_ID = " + req.query.DId;

            console.log(queryString);

            request.query(queryString, function (err, recordset) {
        
                res.json({data : recordset.recordset} );
            });
        });
    } catch (err) {
        alert(err);
    }
});




// router.post('/updateData', function(req, res, next) {
//     try {

//         console.log('updateData');

//         mssql.connect(config, function (err) {

//             console.log('Connect');
//             var request = new mssql.Request();

//             console.log(JSON.parse(req.body.data));
//             //console.log(JSON.parse(req.body.data));

//             var updateObj = JSON.parse(req.body.data);

//             console.log(updateObj.length);

//             var queryString = "";
//             console.log('updateObj :', updateObj);
//             // -- 이전 것과 비교

//             // -- 이걸 프로시저에서 체크해야 하나?
//             // -- 프로시저에서 체크하는 경우 Error가 발생하거나
//             // -- 결과를 Return 받아야 한다.
//             // -- 하지만 여러개를 동작하는 경우이기에 Return 받는것은 맞지 않다.
//             // -- 에러의 경우도 명확한 에러를 확인해야하는데 이러면 확인할 수 없다.

//             // -- 프로시저가 아닌 프로그램에서 진행한다면?

//             // 예외처리는 좀 더 상세 진행하기로 한다.

//             for(i=0; i<updateObj.length; i++) {
//                 var selectQueryString = "SELECT * FROM tBM WHERE BM_i = " + updateObj[i].c_BM_IDs;

//                 console.log("Query : " + selectQueryString);
//                 //res.render()
//                 request.query(selectQueryString, function (err, recordset) {
//                     console.log("BM_i : " + recordset.recordset[0].BM_i);
//                     console.log('i :',i);
//                     console.log("org up : " + updateObj[i].orgUpIDs);
//                     console.log("org lo : " + updateObj[i].orgLoIDs);
//                 });
//                 // console.log('rescordset :', recordset);
//                 if(recordset.recordset[0].BM_UpIDs == updateObj[i].orgUpIDs && recordset.recordset[0].BM_LoIDs == updateObj[i].orgLoIDs) {
//                     queryString += "UPDATE tBM SET BM_UpIDs = " + updateObj[i].c_BM_UpIDs + ", BM_LoIDs = " + updateObj[i].c_BM_LoIDs 
//                     queryString += " WHERE BM_i = " + updateObj[i].c_BM_IDs
//                     queryString += ";";
//                 } else {
//                     res.json({data : 'Error'} );
//                     return;
//                 }
//             }

//             request.query(queryString, function (err, recordset) {
        
//                 //console.log(recordset.recordset)
//                 //res.render()
//                 res.json({data : 'OK'} );
//             });

//             request.input('p_Parameter', sql.NVARCHAR(sql.MAX), '|||ExecTy       ===gvvA|||E_IDs        ===E0000001|||asas         ===  |||');
        
//             request.execute('p__PT_FA', function (err, recordsets, returnValue) {

//                 res.json(
//                     { data : recordsets }
//                 );
//             });
//         });
//     } catch (err) {
//         alert(err);
//         //console.log('error fire')
//     }
//     // res.render('index', { title: 'Express' });

// });

//DB에 리치 에디트 내용 저장
router.post('/contents', async function(req, res){
    try {
        let pool = await mssql.connect(config)
        let contents = req.body.contents
        //첫번째 인서트
        await pool.request()
        .input('contents', mssql.NVarChar, contents)
        .query(`INSERT INTO tC 
                    VALUES(
                        @contents
                        )`
                );
 
        res.json({data:'1'})
    } catch (err) {
        console.log(err);
        console.log('error fire')
    }
})

module.exports = router;