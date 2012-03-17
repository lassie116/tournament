(function () {

    "use strict";

    var members = [],
        member_map = [],
        current_tree = null;

     function $(id) {
         return document.getElementById(id);
     }
     
     function rand(n) {
         return Math.floor(Math.random() * n);
     }

     function init(){
         console.log("hello");
         $('make').addEventListener("click",make);
         $('reset').addEventListener("click",reset);
         $('rename').addEventListener("click",rename);
         $('area').addEventListener("click",win_n);
     }

     function option(a) {
         if (a === undefined) {
             return null;
         }
         return a;
     }
     
     function make_node(no, size, a, b, side) {
         return {"no": no, "a": option(a), "b": option(b),
                 "size": size, side: option(side)};
     }
     
     function isLeaf(node) {
         return (node.a === null);
     }
     
     function make_root() {
         var node = make_node(1, 0),
         root = {"last": 1, "node": node};
         return root;
     }
     
     function insert_node_aux(node, n) {
         if (isLeaf(node)) {
             node.a = make_node(node.no, 0);
             node.b = make_node(n, 0);
             node.size = 2;
             node.no = null;
         } else {
             node.size += 1;
             if (node.b.size < node.a.size) {
                 insert_node_aux(node.b, n);
             } else {
                 insert_node_aux(node.a, n);
             }
         }
     }
     
     function insert_node(r) {
         var no = r.last + 1;
         r.last = no;
         insert_node_aux(r.node, no);
     }
     
     // メンバーの名前をHTMLのテキストエリアから取得する関数
     
     function cano(member_list) {
         var list = [];
         for (var i = 0;i < member_list.length;i++){
             var n = member_list[i];
             if (n !== "") { list.push(n); }
         }
         return list;
     }
     
     // m番目のメンバーの名前を取得する関数
     
     function get_member(m) {
         var n = member_map[m - 1];
         return members[n];
     }
     
     // HTMLを楽に作るための関数群
     
     function wrap_a(str,no){
         return "<a no="+ no +">"+str+"</a>"
     }
     
     function merge_aux(node_side, side, elem) {
         var top_line, center_line, bottom_line,
         mid = elem.pos;
         
         if (side === "a") {
             top_line = Kei.Blank;
             center_line = (node_side === side) ? Kei.BF : Kei.F;
             bottom_line = (node_side === side) ? Kei.BV : Kei.V;
         } else {
             top_line = (node_side === side) ? Kei.BV : Kei.V;
             center_line = (node_side === side) ? Kei.BL : Kei.L;
             bottom_line = Kei.Blank;
         }
         
         var result = [];
         for (var i = 0;i < elem.list.length;i++){
             var line;
             var e = elem.list[i];
             if (i < mid) {
                 line = top_line;
             } else if (i === mid) {
                 line = center_line;
             } else {
                 line = bottom_line;
             }
             result.push(Kei.Blank + line + e);
         }
         
         return result;
     }
     
     function merge(node, a, b) {
         var new_a, new_b;
         new_a = merge_aux(node.side, "a", a);
         new_b = merge_aux(node.side, "b", b);
         new_a.push((node.side !== null) ?
                    (Kei.BH + Kei.BT) : (Kei.H + Kei.T));
         return {"pos": new_a.length - 1, "list": new_a.concat(new_b)};
     }
     
     function disp_aux(node) {
         var name;
         if (isLeaf(node)) {
             name = get_member(node.no);
             return {"pos": 0,
                     "list": [((node.side !== null) ? Kei.BH : Kei.H) +
                              Kei.Blank + wrap_a(name, node.no)]};
         } else {
             return merge(node, disp_aux(node.a), disp_aux(node.b));
         }
     }
     
     function disp(r) {
         return disp_aux(r.node).list.join("<br />");
     }
     
     // トーナメントデータの勝敗情報を操作する関数群
     
     function won_reset(node) {
         if (node.side === "won") {
             node.side = null;
         }
     }
     
     function win_aux(node, n) {
         if (isLeaf(node)) {
             if (node.no === n) {
                 node.side = "won";
                 return true;
             }
             return false;
         }
         if (win_aux(node.a, n)) {
             if (node.side !== "a") {
                 node.side = "a";
                 won_reset(node.b);
                 return false;
             }
         } else if (win_aux(node.b, n)) {
             if (node.side !== "b") {
                 node.side = "b";
                 won_reset(node.a);
                 return false;
             }
         } else {
             return false;
         }
         return true;
     }

     function draw() {
         $('area').innerHTML = disp(current_tree);
     }
     
     function map_init() {
         for (var i = 0;i<members.length;i++){
             member_map[i] = i;
         }
     }

     function shuffle() {
         var a, temp,
         n = members.length,
         list = member_map;
         
         for (var i = 0;i< n - 1;i++){
             a = rand(n - i);
             temp = list[i];
             list[i] = list[i + a];
             list[i + a] = temp;
         };
         return list;
     }
     
     function make_tree() {
         current_tree = make_root();
         for (var i = 0;i < members.length - 1;i++) {
             insert_node(current_tree);
         };
     }
     
     function member_update() {
         members = cano($('member').value.split("\n"));
     }
     
     function make() {
         member_update();
         map_init();
         shuffle();
         make_tree();
         draw();
     }
     
     function reset_aux(node) {
         if (node !== null) {
             node.side = null;
             reset_aux(node.a);
             reset_aux(node.b);
         }
     }
     
     function reset() {
         var r = current_tree,
         rootnode = r.node;
         reset_aux(rootnode);
         draw();
     }

     function rename() {
         member_update();
         draw();
     }
     
     function win_n(ev) {
         var attr = ev.target.attributes["no"];
         if (attr == undefined) return;
         var n = attr.nodeValue;
         var r = current_tree,
         rootnode = r.node;
         win_aux(rootnode, parseInt(n));
         draw();
     }
     
     window.onload = init;
}());
