/*
 * @Author: yukaiwei 
 * @Date: 2020-07-15 09:15:49 
 * @Last Modified by: yukaiwei
 * @Last Modified time: 2020-07-20 17:58:08
 */
(function (global,factory) {
	// 判断引入方式
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() :
	typeof define === "function" && define.amd ? difine(factory) : global.treeTable = factory()	
})(this,function () {'use strict';
// 处理数据生成tree数据
function deelData (data,id,fatherId) {
	if (!(data instanceof Array)) {
		throw new Error("TreeTable.deelData(array):Expected 'data'应为一个Array数组数据类型");
		return false;
	}      
    let map = {}
	let treeData = []
    data.forEach ((item)=>{
        map[item[id]] = item
    })
    data.forEach ((item)=>{
        const parent = map[item[fatherId]]
        parent ? (parent.children ? parent.children.push(item) : (parent.children = []).push(item)) : treeData.push(item)
	})
    return treeData
}
// 生成表头
function setTh (array) {
    if (!(array instanceof Array))
            throw new Error("setTh(array): Expected 'thead' 应为一个Array数据类型") ;
    let ths = [];
    for (let i in array) {
        let th = document.createElement("span");
        th.textContent = String(array[i]);
        ths.push(th);
}
    return ths;
}
//  随tree的深度生成点击按钮 和空span用于缩进
function DefaultFormat (crudata,row, attr = { indent: 0, has_childs: false },timeName) {
	let columns = [];
	if (row.length == 0) {
		throw new Error("TreeTable.DefaultFormat(row): Expected row至少包含 1 个内容");
	}
	let column = document.createElement("td");	
	for (let i = 0; i < attr.indent; i++) column.appendChild(CreateIndent());
	if (attr.has_childs) column.appendChild(TreeTable_CreateDropButton());
	column.appendChild(document.createTextNode(crudata[row[0]]));
	columns.push(column);
	for(let i = 1; i < row.length; i++) {
		if (row[i]==timeName) {
			Date.prototype.toLocaleString = function() {
				return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate() + "  " + this.getHours() + ":" + this.getMinutes();
		  };
			let unixTimestamp = new Date(crudata[row[i]]) ;
			let commonTime = unixTimestamp.toLocaleString();
			let column = document.createElement("td");
			column.setAttribute("tabindex", "0");
			column.textContent =commonTime;
			columns.push(column);
		}else{
			let column = document.createElement("td");
			column.setAttribute("tabindex", "0");
			column.textContent = crudata[row[i]];
			columns.push(column);
		}
		
	}
	return columns;
}
// 生成是span函数 
function CreateIndent() {
    let indent = document.createElement("span");
    indent.classList.add("indent");
    return indent;
}
// 隐藏
function hideChildren(row) {
	let reference_indent = row.getAttribute("treetable:level");
	let sibling = row;
	while (sibling = sibling.nextSibling) {
		let sibling_indent = Number(sibling.getAttribute("treetable:level"));
		if (sibling_indent <= reference_indent) break;
		sibling.style.display = "none";
	}	
}
// 展示
function showChildren(row) {
	let reference_indent = row.getAttribute("treetable:level");
	let sibling = row;
	while (sibling = sibling.nextSibling) {
		let sibling_indent = Number(sibling.getAttribute("treetable:level"));
		if (sibling_indent <= reference_indent) break;
		sibling.style.display = "table-row";
	}
}
// 生成button按钮 并控制下一级的显示隐藏
function TreeTable_CreateDropButton() {	
	let button = document.createElement('span');
    button.classList.add("expand-button")
    button.setAttribute("tabindex", "0"); 
    button.addEventListener('click', function() {
		// console.log(this.parentNode.parentNode)
        let row = this.parentNode.parentNode; // tr
        let state = SwitchExpanded(row);
        state ? showChildren(row):hideChildren(row);
    });
    function SetState(row, state) {
        row.setAttribute("expanded", state);
    }
	// 切换expanded的值
    function SwitchExpanded(row) {
        let state =(Boolean(row.getAttribute("expanded") === "true" ? true : false) && row.hasAttribute("expanded"));
        row.setAttribute("expanded", !state);
        return !state;
    }
    return button;
}
// 获取当前节点的数据
function getCurrentNodeData(id,treeData,idName){
	let currentData = null
	function getData (id,treeData,idName) {
		treeData.forEach ((item) =>{
			if (item[idName]===id) {
				currentData = item
			} else if (item.children && item.children.length > 0) {
				getData (id,item.children,idName)
			} else {
				return undefined;
			}
		})
	}
	getData (id,treeData,idName)
	return currentData
}
// 增
function treeDataInsert (treeData,id,idName,fatherIdName,data) {
	function insertData(id,treeData,idName,fatherIdName,data) {
		treeData.forEach ((item) =>{
			if (item[idName]===id) {
				item[fatherIdName]=data[idName]
				item.children ? item.children.unshift(data) :item.children = [data] 
			} else if (item.children && item.children.length > 0) {
				insertData(id,item.children,idName,fatherIdName,data)
			} else {
				return undefined
			}
		})
	
	}
	insertData (id,treeData,idName,fatherIdName,data)
}
// 删
function treeDataDelete (treeData,id,idName,fatherIdName,data) {
	let remainData = []
	function deleteData(id,treeData,idName,fatherIdName,data) {
		treeData.forEach ((item) =>{
			if (item[idName]===id) {
				return true;
			}else{
				remainData.push(item)
				if (item.children && item.children.length > 0) {
					deleteData(id,item.children,idName,fatherIdName,data)
				}
			}
		})
	}
	deleteData (id,treeData,idName,fatherIdName,data)
	remainData.forEach((item)=>{
		if (item.children) {
			item.children = []
		} 
	})
	return deelData (remainData,idName,fatherIdName)
	
}
// 改
function treeDataEdit (treeData,id,idName,fatherIdName,data) {
	function editData(id,treeData,idName,fatherIdName,data) {
		treeData.forEach ((item) =>{
			if (item[idName]===id) {
				for (let key in data) {
					item[key]=data[key]
				}
			} else if (item.children && item.children.length > 0) {
				editData(id,item.children,idName,fatherIdName,data)
			} else {
				return undefined
			}
		})
	
	}
	editData (id,treeData,idName,fatherIdName,data)
}
// 生成edit表单收取数据
function createFormToGetEidtData (id,data,idName,fatherName){
    let currentData	= getCurrentNodeData (id,data,idName)
	let formBox =document.createElement("div")
	let str=""
	for (let key in currentData) {
        if (key !== idName && key !== fatherName && key !== "children" ) {
			str+=`  <div class="wrapper">
						<div class="input-data">
							<input type="text" name="${key}" value="${currentData[key]}" required>
							<div class="underline"></div>
							<label>${key}</label>
						</div>
					</div>`
		}
	  }
	formBox.style.visibility='visible';
	formBox.id="editDataForm_wrapper"
	formBox.classList.add("formBox_wrapper")
	formBox.innerHTML = `<from id="addDataForm"> <div class="getData_form">
							${str}
							<div class="formButton">
								<input type="submit"  value="确定" onclick="treeTableEditSubmit()"/>
								<input type="button"  value="取消" onclick="treeTableEditCancel()"/>
							</div>
						</div></from>` 
	return formBox
}
// 添加表单
function createFormToGetData (id,data,idName,fatherName,timeName){
    let currentData	= getCurrentNodeData (id,data,idName)
	let formBox =document.createElement("div")
	let nowDate= Date.parse(new Date());
	let str=""
	for (let key in currentData) {
        if (key == idName) {
			str+= ` <div class="wrapper">
						<div class="input-data">
							<input type="text" name="${idName}" value="${nowDate}" required>
							<div class="underline"></div>
							<label>${key}</label>
						</div>
	 		 	    </div>`
        }else if (key == fatherName) {
			str+=`  <div class="wrapper">
						<div class="input-data">
							<input type="text" name="${fatherName}" value="${currentData[idName]}"required>
							<div class="underline"></div>
							<label>${key}</label>
						</div>
	 		 	    </div>`
		} else if (key == timeName) {
			str+=`  <div class="wrapper">
						<div class="input-data">
							<input type="text" name="${key}" value="${nowDate}"required>
							<div class="underline"></div>
							<label>${key}</label>
						</div>
	 		 	    </div>`
		} else if (key !== "children"){
			str+=`  <div class="wrapper">
						<div class="input-data">
							<input type="text" name="${key}" value="测试" required>
							<div class="underline"></div>
							<label>${key}</label>
						</div>
					</div>`
		}  
	  }
	formBox.style.visibility='visible';
	formBox.id="addDataForm_wrapper"
	formBox.classList.add("formBox_wrapper")
	formBox.innerHTML = `<from id="addDataForm"> <div class="getData_form">
							${str}
							<div class="formButton">
								<input type="submit" value="确定" onclick="treeTableSubmit()"/>
								<input type="button" value="取消" onclick="treeTableCancel()"/>
							</div>
						</div></from>` 
	return formBox
}
// treeTabl构造函数
function treeTable(data) {
	document.oncontextmenu = function(){return false}
	let treeData=deelData(data.data,data.idName,data.fatherIdName)
	const idName=data.idName
	const timeName=data.timeName
	const columns=data.columns
	const fatherIdName=data.fatherIdName
	let wrap=document.querySelector(data.el)
	let table=document.createElement("table")
	let tableHead=document.createElement("thead")
	let tableBody=document.createElement("tbody")
	var header = [];
	
	table.classList.add("treetable");
    table.appendChild(tableHead);
    table.appendChild(tableBody);
	wrap.appendChild(table);

// 生成thead 
	let thead=setTh(data.thead)
	// console.log(thead)
	this.SetHeader = function(array) {
        if (!(array instanceof Array)) {
			throw new Error("TreeTable.SetHeader(array): Expected 'array' to be an instance of 'Array'");
		}
        for (let i in array) {
            if (!(array[i] instanceof Element))
                throw new Error("TreeTable.SetHeader(array): Expected every item of 'array' to be an instance of 'Element'");
		}
		header=array
		if (header.length > 0) {
			let header_tr = document.createElement("tr");
			for (let i in header) {
				let th = document.createElement("th");
				th.appendChild(header[i]);
				header_tr.appendChild(th);
			}
			tableHead.appendChild(header_tr);
		}
	},
	// tbody生成
	this.BuildRows=function (data,col, indent = 0) {
		let rows = [];
		for (let i in data) {
			let config = {
				indent: indent,
				has_childs:data[i].children && data[i].children.length>0
			};
			let columns = DefaultFormat(data[i],col, config,timeName);
			let row = document.createElement("tr");
			row.setAttribute("treetable:level", indent);
			row.setAttribute("id", data[i][idName]);
			for (let j in columns) {
				row.appendChild(columns[j]);
			}

			let subrows = [];
			if (config.has_childs) {
				row.classList.add("expandable");
				row.setAttribute("expanded","true");
				subrows = this.BuildRows(data[i].children,col, indent+1);
			}
			row.setAttribute("tabindex", "0");
			row.setAttribute("onmousedown", "treeTableClickEvent(event,this)");
			rows.push(row);
			rows = rows.concat(subrows)	
		}
		return rows;
	};
	// 打开编辑页面
	this.openAddForm = function (curretNodeId) {
		if (treeData) {
			let formBox = createFormToGetData(curretNodeId,treeData,idName,fatherIdName,timeName)
		table.appendChild(formBox)
		} else {
			alert("系统错误 ！！请从新刷新")
		}
		
	}
	// 插入子节点
	this.insertChildNode = function (position,data){
		if (position.getAttribute("expanded")==null) {
			position.setAttribute("expanded","true")
			position.classList.add("expandable")
			position.firstElementChild.insertBefore(TreeTable_CreateDropButton(),position.firstElementChild.lastChild)
		}
		let indent =Number(position.getAttribute("treetable:level")) + 1 
		let newNode = document.createElement("tr")
		newNode.setAttribute("treetable:level", indent); 
		newNode.setAttribute("tabindex", "0");
		newNode.setAttribute("tabindex", "0");
		newNode.setAttribute("onmousedown", "treeTableClickEvent(event,this)"); 
		newNode.id = data[idName]
		let firstChildNode=document.createElement("td")
		for (let i = 0; i <indent; i++) {
			firstChildNode.appendChild(CreateIndent())
		}
		firstChildNode.appendChild(document.createTextNode(data[columns[0]]));
		newNode.appendChild(firstChildNode)
		for (let i = 1; i <columns.length; i++) {
			if (columns[i]==timeName) {
				let unixTimestamp = new Date(Number(data[columns[i]])) ;
				let commonTime = unixTimestamp.toLocaleString();
				let column = document.createElement("td");
				column.setAttribute("tabindex", "0");
				column.textContent = commonTime;
				newNode.appendChild(column)
			}else{
				let column = document.createElement("td");
				column.setAttribute("tabindex", "0");
				column.textContent = data[columns[i]];
				newNode.appendChild(column)
			}
			
		}
		position.parentNode.insertBefore(newNode,position.nextSibling)
		treeDataInsert(treeData,position.id,idName,fatherIdName,data)
	}
// 删除当前节点
	this.removeCurrentNode = function(id){
		let currentNode = document.getElementById (id)
		let botton =currentNode.previousSibling.firstElementChild.lastElementChild
		let nextLevel=currentNode.nextSibling.getAttribute("treetable:level") 
		let currentLevel=currentNode.getAttribute("treetable:level") 
		let previousLevel=currentNode.previousSibling.getAttribute("treetable:level") 
		if ( previousLevel < currentLevel && nextLevel < currentLevel) {
			botton.remove()
			currentNode.previousSibling.removeAttribute("expanded")
		}
		let deletes=[]
		function deleteChildren(row) {
			let reference_indent = row.getAttribute("treetable:level");
			let sibling = row;
			while (sibling = sibling.nextSibling) {
				let sibling_indent = Number(sibling.getAttribute("treetable:level"));
				if (sibling_indent <= reference_indent) break;
				deletes.push(sibling)
			}
		}
		deleteChildren(currentNode)
		deletes.push(currentNode)
		for (let i = 0; i < deletes.length; i++) {
			deletes[i].remove()
		}
		treeData = treeDataDelete(treeData,id,idName,fatherIdName)
	}
	// 改
	this.openEditForm= function(id){
		if (treeData instanceof Array) {
			let formBox = createFormToGetEidtData(id,treeData,idName,fatherIdName)
			table.appendChild(formBox)	
		} else {
			alert("系统错误！！ 请从新刷新")
		}
	},
	this.editCurrentNode= function (row,data) {
		let tds=row.getElementsByTagName("td")
		tds[0].innerHTML=''
		for (let i = 0; i <row.getAttribute("treetable:level"); i++) {
			tds[0].appendChild(CreateIndent())
		}
		tds[0].appendChild (document.createTextNode(data[columns[0]]));
		for (let i = 1; i < tds.length; i++) {
			tds[i].innerText = data[columns[i]]
		}
		treeDataEdit (treeData,row.id,idName,fatherIdName,data)
	},
	this.printTreeData= function(){
		console.log(treeData);
	},
	// CreateMenu(table);
	this.SetHeader(thead)
	this.BuildRows(treeData,data.columns).forEach(element => {
		table.tBodies[0].appendChild(element);
	});
}
	return treeTable
})