// 数据字典
var CMMG_DICT = {};

/**
 * 一些插件的封装和共用方法
 */
var CM_Components = function () {

    // 字典数据绑定【下拉列表】
    function dictDataBinding(selectIds) {

        function bandingById(id) {
            var sel = $("#" + id);
            var selCode = sel.attr("code");
            var dict = CMMG_DICT[selCode];
            sel.append("<option value=''>全部</option>");
            if (dict) {
                for (var i = 0; i < dict.length; i++) {
                    sel.append("<option value='" + dict[i].code + "'>" + dict[i].name + "</option>");
                }
            } else {
                var params = {"code": selCode};
                $.ajax({
                    url: CM_Components.getContextAll("/dict/query"),
                    type: "POST",
                    async: false,
                    contentType: 'application/json',
                    data: JSON.stringify(params),
                    success: function (result) {
                        dict = result;
                        CMMG_DICT[selCode] = result;
                        for (var i = 0; i < dict.length; i++) {
                            sel.append("<option value='" + dict[i].code + "'>" + dict[i].name + "</option>");
                        }
                    },
                    error: function (xhr, status, error) {
                        CM_Components.layerMsg("查询失败！");
                    }
                });
            }
        }

        if (!selectIds) {
            console.error("参数为空");
            return;
        }

        if (typeof selectIds === 'string') {
            bandingById(selectIds);
        } else {
            for (var i = 0; i < selectIds.length; i++) {
                bandingById(selectIds[i]);
            }
        }
    }

    // 数据字典查询
    function dictByKey(code, key) {
        var dict = CMMG_DICT[code];
        if (dict) {
            for (var i = 0; i < dict.length; i++) {
                if (dict[i].code === key) {
                    return dict[i].name;
                }
            }
        } else {
            var params = {"code": code};
            $.ajax({
                url: CM_Components.getContextAll("/dict/query"),
                type: "POST",
                cache: false,
                async: false,
                contentType: 'application/json',
                data: JSON.stringify(params),
                success: function (result) {
                    CMMG_DICT[code] = result;
                },
                error: function (xhr, status, error) {
                    CM_Components.layerMsg("查询失败！");
                }
            });
            return dictByKey(code, key);
        }
        return null;
    }

    function dictByCode(code) {
        var dict = CMMG_DICT[code];
        if (dict) {
            return dict;
        } else {
            var params = {"code": code};
            $.ajax({
                url: CM_Components.getContextAll("/dict/query"),
                type: "POST",
                async: false,
                contentType: 'application/json',
                data: JSON.stringify(params),
                success: function (result) {
                    CMMG_DICT[code] = result;
                    dict = result;
                },
                error: function (xhr, status, error) {
                    CM_Components.layerMsg("查询失败！");
                }
            });
        }
        return dict;
    }


    var getContextPath = function () {
        var pathName = document.location.pathname;
        var index = pathName.substr(1).indexOf("/");
        var result = pathName.substr(0, index + 1);
        return result;
    }
    /**
     * ajax方式获取整个页面的代码
     * @param ajaxUrl
     * @param data
     * @param targetClass 一般是page-content
     */
    var getPageData = function (ajaxUrl, data, targetClass) {
        $.ajax({
            url: ajaxUrl,
            data: data,
            dataType: "html",
            beforeSend: function (XMLHttpRequest) {
                // 显示遮罩层
                App.blockUI({target: '.' + targetClass, animate: true});
            },
            success: function (htmlData) {
                $("." + targetClass).html(htmlData);
            },
            complete: function (XMLHttpRequest, textStatus) {
                //请求结束方法增强处理  ,隐藏遮罩层
                App.unblockUI('.' + targetClass);
            },
            error: function (response) {
                $("." + targetClass).html(response.responseText);
            }
        });
    }
    /**
     * 绑定左侧菜单的点击事件
     */
    var handleLeftMenuClick = function () {
        $(".page-sidebar-menu").off("click", "li > a").on("click", "li > a", function () {
            var $this = $(this);
            var $sideBar = $(".page-sidebar-menu");
            // //选中子菜单
            // var ajaxUrl=$(this).attr("href");
            // if(ajaxUrl==="#" || ajaxUrl==="javascript:;"){
            //     return;
            // }
            //getPageData(ajaxUrl,"","page-content");
            $sideBar.find("li").removeClass("active open");
            $sideBar.find(".selected").remove();
            $this.closest("li").addClass("active open");
            $this.find(".title").after("<span class='selected' ></span>");
            return;
        });
    }

    /**
     * 初始化基本表格 v
     * @param tableId
     * @param queryUrl
     * @param columns
     * @returns {jQuery}
     */
    var initBootStrapTable = function (table, ajaxUrl, columns) {
        table.bootstrapTable({
            method: 'get',
            url: ajaxUrl,
            cache: false,
            dataType: "json",
            striped: false,	 //使表格带有条纹
            sortable: true,
            pagination: true,	//在表格底部显示分页工具栏
            pageSize: 10,
            pageNumber: 1,
            pageList: [10, 15, 20],
            idField: "id",  //标识哪个字段为id主键
            showToggle: false,   //名片格式
            cardView: false,//设置为True时显示名片（card）布局
            singleSelect: false,//复选框只能选择一条记录
            search: false,//是否显示右上角的搜索框
            // clickToSelect: true,//点击行即可选中单选/复选框
            sidePagination: "server",//表格分页的位置
            queryParamsType: "", //参数格式,发送标准的RESTFul类型的参数请求
            strictSearch: true,
            showColumns: false,     //是否显示所有的列
            showRefresh: false,     //是否显示刷新按钮
            minimumCountColumns: 2,    //最少允许的列数
            checkbox: true,
            responseHandler: function (res) {
                return {
                    "rows": res.dataList,
                    "total": res.total
                };
            },
            silent: true,  //刷新事件必须设置
            formatNoMatches: function () {  //没有匹配的结果
                return '无符合条件的记录';
            },
            rowStyle: function (row, index) {
                return {classes: "cursorHand"}
            },
            columns: columns
        });
    }

    /**
     * 表单查询
     * @param tableId 数据表格id
     * @param queryUrl 查询路径
     * @param columns 显示列
     * @param requestData 请求数据 json格式
     * @returns {jQuery}
     */
    var formQueryGet = function (table, ajaxUrl, columns, requestData) {
        table.bootstrapTable({
            method: 'get',
            url: ajaxUrl,
            cache: false,
            dataType: "json",
            striped: false,	 //使表格带有条纹
            sortable: true,
            pagination: true, //在表格底部显示分页工具栏
            pageSize: 10,
            pageNumber: 1,
            // userName:requestData.userName,
            // loginName:requestData.loginName,
            // phone:requestData.phone,
            pageList: [10, 15, 20],
            idField: "id",  //标识哪个字段为id主键
            showToggle: false,   //名片格式
            cardView: false,//设置为True时显示名片（card）布局
            singleSelect: false,//复选框只能选择一条记录
            search: false,//是否显示右上角的搜索框
            clickToSelect: true,//点击行即可选中单选/复选框
            sidePagination: "server",//表格分页的位置
            queryParamsType: requestData, //参数格式,发送标准的RESTFul类型的参数请求
            strictSearch: true,
            showColumns: false,     //是否显示所有的列
            showRefresh: false,     //是否显示刷新按钮
            minimumCountColumns: 2,    //最少允许的列数
            responseHandler: function (res) {
                return {
                    "rows": res.dataList,
                    "total": res.total
                };
            },
            silent: true,  //刷新事件必须设置
            formatNoMatches: function () {  //没有匹配的结果
                return '无符合条件的记录';
            },
            rowStyle: function (row, index) {
                return {classes: "cursorHand"}
            },
            columns: columns
        });
    }
    /**
     * 弹出层
     */
    var layerOpen = function (title, width, height, content) {
        return layer.open({
            type: 2,
            skin: "cm-custom-layer",
            title: title,
            area: [width, height],
            fix: false, //不固定
            shadeClose: false,
            shade: 0.5,
            scrollbar: false,
            content: content,
            success: function (layero, index) {
                // layui-layer-iframe2
                var loginPage;
                // js获取ifram中的元素
                loginPage = window.frames["layui-layer-iframe" + index].document.getElementById("cpmg-login");

                // jq获取iframe中的元素
                // loginPage=$("#layui-layer-iframe"+index).contents().find("#cpmg-login");
                // 如果会话失效，重定向只登陆页面
                if (loginPage) {
                    window.location = CM_Components.getContextAll("/login");
                }
            }
        });
    }

    // /**
    //  * 关闭弹出层
    //  */
    // var layClose = function (index) {
    //     layer.close(index);
    // }
    /**
     * 刷新表格方法
     * @param tableId
     */
    var refreshTable = function (table) {
        table.bootstrapTable('refresh');
    }
    /**
     * 获取表格选中行
     * @param table
     */
    var getTableSelections = function (table) {
        return table.bootstrapTable('getSelections');
    }
    /**
     * bootstrapSweetAlert提示框--简单api
     */
    var bootstrapSweetAlert = function (sa_title, sa_message, sa_type) {
        swal({
            title: sa_title,
            text: sa_message,
            type: sa_type
        });
    }
    /**
     * form表单ajax提交封装方法
     */
    var ajaxFormSumbitTable = function (ajaxUrl, formId, pTableId) {
        swal({
                title: "确定提交表单?",
                text: "",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    ajaxFormSubmit(ajaxUrl, formId, pTableId);
                } else {
                    swal("", "已经取消了当前操作", "error");
                }
            });
    }
    /**
     * Ajax操作
     * @param method
     * @param ajaxUrl
     * @param data
     * @param pTableId
     */
    var ajaxFormSubmit = function (ajaxUrl, formId, pTableId) {
        $.ajax({
            type: "POST",
            cache: false,
            url: ajaxUrl,
            data: $("#" + formId).serialize(),
            success: function (responseJson) {
                if (responseJson.success == true) {//返回true
                    var index = parent.layer.getFrameIndex(window.name); //获取窗口索引
                    parent.layer.close(index);
                    var pTable = parent.$("#" + pTableId);
                    CM_Components.refreshTable(pTable);//刷新表格
                    (parent.CM_Components).bootstrapSweetAlert("", responseJson.msg, "success");
                }
                if (responseJson.success == false) {//返回false
                    bootstrapSweetAlert("", responseJson.msg, "error");
                }
            },
            beforeSend: function (XMLHttpRequest) {
                //请求之前方法增强处理 ,显示遮罩层
                App.blockUI({target: '#' + formId, animate: true});
            },
            complete: function (XMLHttpRequest, textStatus) {
                //请求结束方法增强处理  ,隐藏遮罩层
                App.unblockUI('#' + formId);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                bootstrapSweetAlert("", "系统错误!!!", "error");
            }
        });
    }

    var ajaxDeleteTable = function (ajaxUrl, table) {
        var rows = CM_Components.getTableSelections(table);
        if (!rows || rows.length == 0) {
            CM_Components.bootstrapSweetAlert("", "请选择要删除的数据", "error");
            return;
        }
        swal({
                title: "确定删除?",
                text: "",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm: true,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var idDataArray = [];
                    $.each(rows, function (i, obj) {
                        idDataArray.push(obj.id);
                    });
                    ajaxDelete(ajaxUrl, idDataArray, table);
                } else {
                    swal("", "已经取消了当前操作", "error");
                }
            });
    }

    var ajaxDelete = function (ajaxUrl, idDataArray, table) {
        $.ajax({
            type: 'DELETE',
            url: ajaxUrl,
            contentType: "application/json",//加入contentType,后端需要用requestBody接受参数,此时的参数不在request里面了
            data: JSON.stringify(idDataArray),
            dataType: "json",
            success: function (responseJson) {
                if (responseJson.success == true) {
                    table.bootstrapTable('refresh');
                    CM_Components.layerMsg(responseJson.msg);
                    //CM_Components.bootstrapSweetAlert("", responseJson.msg, "success");
                } else {
                    CM_Components.bootstrapSweetAlert("", responseJson.msg, "error");
                }
            },
            error: function (response) {
                CM_Components.bootstrapSweetAlert("", "系统错误,请联系管理员!!", "error");
            }
        });
    }

    /**
     *  form组装
     * @param form
     * @returns {{}}
     */
    var getFormData = function (form) {
        var formData = {};
        var name;
        var currentInput;
        var inputType;

        var list = $("#" + form + " input");
        for (var i = 0; i < list.length; i++) {
            currentInput = $(list[i]);
            name = currentInput.attr("name");
            if (!name) {
                continue;
            }
            inputType = currentInput.attr("type");
            // 复选框
            if (inputType == "checkbox") {
                if (!currentInput.is(":checked")) {
                    continue;
                }
                if (!formData[name]) {
                    formData[name] = [];
                }
                formData[name].push(currentInput.val());
                continue;
            }
            // 单选
            if (inputType == "radio" && !currentInput.is(":checked")) {
                continue;
            }
            formData[name] = currentInput.val();
        }
        var currDom;
        $("#" + form + " select").each(function () {
            currDom = $(this);
            formData[currDom.attr("name")] = currDom.val();
        });
        return formData;
    }

    // var index;
    return {
        dictByCode: function (code) {
            return dictByCode(code);
        },
        dictByKey: function (code, key) {
            return dictByKey(code, key);
        },
        /**
         * 单个ID直接传入ID字符串几个，多个使用数据进行组装
         * @param selectIds
         */
        dictDataBinding: function (selectIds) {
            dictDataBinding(selectIds);
        },
        getFormData: function (form) {
            return getFormData(form);
        },
        initIndexLeftMenu: function () {
            handleLeftMenuClick();
        },
        initBootStrapTable: function (table, ajaxUrl, columns) {
            initBootStrapTable(table, ajaxUrl, columns);
        },
        // 查询
        query: function (table, ajaxUrl, columns, queryData) {
            //initBootStrapTable(table, ajaxUrl, columns);
            formQueryGet(table, ajaxUrl, columns, queryData);
        },
        layerOpen: function (title, width, height, content) {
            layerOpen(title, width, height, content);
        },
        layerClose: function () {
            //先得到当前iframe层的索引
            var index = parent.layer.getFrameIndex(window.name);
            //再执行关闭
            parent.layer.close(index);
        },
        layerMsg: function (msgContent) {
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.msg(msgContent);
        },
        refreshTable: function (table) {
            refreshTable(table);
        },
        getTableSelections: function (table) {
            return getTableSelections(table);
        },
        bootstrapSweetAlert: function (sa_title, sa_message, sa_type) {
            bootstrapSweetAlert(sa_title, sa_message, sa_type);
        },
        ajaxFormSumbitTable: function (ajaxUrl, formId, pTableId) {
            ajaxFormSumbitTable(ajaxUrl, formId, pTableId);
        },
        ajaxDeleteTable: function (ajaxUrl, table) {
            ajaxDeleteTable(ajaxUrl, table);
        },
        getContextPath: function () {
            return getContextPath();
        },
        getPageData: function (ajaxUrl, data, targetClass) {
            getPageData(ajaxUrl, data, targetClass);
        },
        getContextAll: function (api_path) {
            // 获取当前jsp文件的绝对路径
            var strFullPath = window.document.location.href;
            // 获取当前jsp文件在web中的相对路径
            var strPath = window.document.location.pathname;
            // 获取jsp文件在绝对路径中的索引位置
            var pos = strFullPath.indexOf(strPath);
            // 获取主机地址
            var prePath = strFullPath.substring(0, pos);
            // 获取项目名称 如：/Web_Test
            var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
            return (prePath + postPath + api_path);
        }
    }
}();