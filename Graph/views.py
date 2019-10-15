from django.shortcuts import render, redirect
from django.template.loader import get_template
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
from bson.objectid import ObjectId
from networkx.readwrite.json_graph import node_link_data, node_link_graph
import json
import networkx as nx
import ast
import datetime
import multiprocessing as mp

def homepage(request):
	template = get_template('index.html')
	html = template.render()
	return redirect('/graph/')

def graph(request):
    template = get_template('graph.html')
    level = ['第1層', '第2層']
    html = template.render(locals())
    return HttpResponse(html)

@csrf_exempt
def search_prisoner(request):
    print(request.POST)
    prisoner = request.POST['prisoner']

    client = MongoClient('140.120.13.244', 27018)
    # Node = list(client.Law.Node_2019.find({}, no_cursor_timeout=True))
    result = []

    for index, n in enumerate(client.Law.Node_2019.find({ '$text': { '$search': prisoner } }, no_cursor_timeout=True)):
        # print(index)
        if(prisoner in n['name']):
            result.append(n['name'])

    result = {'prisoner': result}
    return JsonResponse(result)

def demo_page(request):
    template = get_template('graph_demo.html')
    level = ['第1層', '第2層']
    html = template.render(locals())
    return HttpResponse(html)

@csrf_exempt
def get_graph_data_for_demo(request):
    print(request.POST)

    with open('Wei_data.json', 'r', encoding='UTF-8') as F:
        result = json.load(F)


    # result = {'Map': Map, 'Link': Link}
    
    # with open('Wei_data.json', 'w', encoding='UTF-8') as F:
    #     json.dump(result, F, ensure_ascii=False)

    # print(result)

    return JsonResponse(result)

def node_process(name):
    client = MongoClient('140.120.13.244', 27018)
    this_Node = client.Law.Node_2019.find({'name': name})[0]
    this_Node = {'name': name, 'v_id': this_Node['v_id'], 'reason': this_Node['reason'], 'sys': this_Node['sys'], 'court': this_Node['court'], 'type': this_Node['type'], 'no': this_Node['no'], 'date': this_Node['date']}
    return this_Node

@csrf_exempt
def get_graph_data(request):
    start = datetime.datetime.now()
    print(request.POST)
    prisoner = request.POST['prisoner']
    level = request.POST['level']

    # global Node, Link, Edge
    Node = [] # Graph node
    Link = [] # Graph edge
    Target = [prisoner] # 現在level要找的node
    haveFindNode = [] # 曾經找過的node
    Edge = {} # 所有node的edge
    Map = []

    for l in range(int(level)): 
        for t in Target:
            get_node(t, Node, Edge)
            haveFindNode.append(t)
        Target = []
        for n in Node: # target為新增的node中 不曾找過的node
            if(n not in haveFindNode): # 曾經找過node 不再是下次target
                Target.append(n)
        

    # Get all edge
    get_Edge(Node, Edge, Link)

    # Get node information
    pool = mp.Pool() 
    Node_result = []
    for n in Node:
        print(n)
        p = pool.apply_async(node_process, args=(n,)) 
        Node_result.append(p)
    for r in Node_result:
        Map.append(r.get())
    pool.close()
    pool.join()

    result = {'Map': Map, 'Link': Link}

    time = datetime.datetime.now() - start
    print('Time:', time)
    
    # print(result)

    return JsonResponse(result)

def get_node(prisoner, Node, Edge): # 取得所有鄰居node
    client = MongoClient('140.120.13.244', 27018)
    if(prisoner not in Node):
        Node.append(prisoner)
    if(prisoner not in Edge):
        this_Edge = list( client.Law.Edge_2019.find({'from_Name': prisoner}))
        Edge[prisoner] = this_Edge
    else:
        this_Edge = Edge[prisoner]

    for e in this_Edge:
        if(e['to_Name'] not in Node):
            Node.append(e['to_Name'])

def edge_process(ni, Node, Edge):
    client = MongoClient('140.120.13.244', 27018)
    Link = []
    if(ni not in Edge):
        this_Edge = list( client.Law.Edge_2019.find({'from_Name': ni}))
        Edge[ni] = this_Edge
    else:
        this_Edge = Edge[ni]
    for e in this_Edge:
        for nj_index, nj in enumerate(Node):
            print('nj_index:', nj_index, 'ni', ni)
            if(e['to_Name'] == nj):
                Link.append({'source': Node.index(e['from_Name']), 'target': Node.index(e['to_Name']), 'weight': e['weight'], 'v_id': e['v_id'], 'reason': e['reason'], 'sys': e['sys'], 'court': e['court'], 'type': e['type'], 'no': e['no'], 'date': e['date']})
    # q.put(Link)

    return Link
    
def get_Edge(Node, Edge, Link): # 取得所有node的edge
    
    # get one edge between two node
    # for ni_index, ni in enumerate(Node):
    #     for nj_index, nj in enumerate(Node):
    #         this_Edge = client.Law.Edge_2019.find_one({'from_Name': ni, 'to_Name': nj})
    #         print('ni_index:', ni_index, 'nj_index:', nj_index)
    #         if(this_Edge != None):
    #             Link.append({'source': ni_index, 'target': nj_index, 'weight': this_Edge['weight'], 'verdict': this_Edge['v_id'], 'title': this_Edge['reason']})

    # print('Node', Node)
    
    # get all edge in one node
    # for ni_index, ni in enumerate(Node):
    #     if(ni not in Edge):
    #         this_Edge = list( client.Law.Edge_2019.find({'from_Name': ni}))
    #         Edge[ni] = this_Edge
    #     else:
    #         this_Edge = Edge[ni]
    #     the_edge_to_name = []
    #     for e in this_Edge:
    #         the_edge_to_name.append(e['to_Name'])
    #     for nj_index, nj in enumerate(Node):
    #         print('ni_index:', ni_index, 'nj_index:', nj_index, 'ni', ni)
    #         if(nj in the_edge_to_name):
    #             e = this_Edge[the_edge_to_name.index(nj)]
    #             Link.append({'source': Node.index(e['from_Name']), 'target': Node.index(e['to_Name']), 'weight': e['weight'], 'v_id': e['v_id'], 'reason': e['reason'], 'sys': e['sys'], 'court': e['court'], 'type': e['type'], 'no': e['no'], 'date': e['date']})
    
    # muti-process
    # q = mp.Queue()
    # for ni_index, ni in enumerate(Node):
    #     print('ni_index', ni_index)
    #     p = mp.Process(target=edge_process, args=(q, ni, Node, Edge))  
    #     p.start()
    #     p.join()
    #     Link += q.get()

    print('cpus: ', mp.cpu_count())
    pool = mp.Pool() 
    result = []
    for ni_index, ni in enumerate(Node):
        print('ni_index', ni_index)
        p = pool.apply_async(edge_process, args=(ni, Node, Edge))  
        result.append(p)
    for r in result:
        Link += r.get()
    pool.close()
    pool.join()


    
import os

@csrf_exempt
def get_shortest_path(request):
    source = request.POST['source']
    target = request.POST['target']
    print(os.getcwd())
    print(source, target)
    # G = nx.Graph()
    client = MongoClient('140.120.13.244', 27018)
    # Edge = list(client.Law.Edge_2019.find({}, no_cursor_timeout=True).batch_size(5))

    # for i, e in enumerate(Edge):
    #     G.add_edge(e['from_Name'], e['to_Name'])
    #     # print(i, " ", e['From Name'], " ", e['To Name'])
    with open ('static/graph/Law_edge_gragh.json', 'r', encoding='UTF-8') as F:
        G = node_link_graph(json.load(F))

    Node = []
    Link = []
    Map = []
    try:
        path = nx.shortest_path(G, source = source, target = target)
        print('path:', path)
        for ni, n in enumerate(path):
            Node.append(n)
            if(ni!=len(path)-1):
                this_Edge = list(client.Law.Edge_2019.find({'from_Name': n, 'to_Name': path[ni+1]}))[0]
                Link.append({'source': ni, 'target': ni+1, 'weight': this_Edge['weight'], 'v_id': this_Edge['v_id'], 'reason': this_Edge['reason'], 'sys': this_Edge['sys'], 'court': this_Edge['court'], 'type': this_Edge['type'], 'no': this_Edge['no'], 'date': this_Edge['date']})
    except:
            path = []
            Node = [source, target]
    
    for n in Node: 
        try:
            this_Node = client.Law.Node_2019.find({'name': n})[0]
            this_Node = {'name': n, 'v_id': this_Node['v_id'], 'reason': this_Node['reason'], 'sys': this_Node['sys'], 'court': this_Node['court'], 'type': this_Node['type'], 'no': this_Node['no'], 'date': this_Node['date']}
        except:
                this_Node = {'name': n}
        Map.append(this_Node)

    # print(Map)
    result = {'Map': Map, 'Link': Link}
    return JsonResponse(result)

@csrf_exempt
def get_verdict(request):
    verdict_id = request.POST['verdict']

    print(verdict_id)

    client = MongoClient('140.120.13.244', 27018)
    Verdict = list(client.Law.Verdict_2019.find({'_id': ObjectId(verdict_id)}))[0]

    result = {'mainText': Verdict['mainText'], 'court': Verdict['court'], 'judgement': Verdict['judgement'], 'no': Verdict['no'], 'type': Verdict['type'], 'sys': Verdict['sys'], 'opinion': Verdict['opinion'], 'reason': Verdict['reason'], 'date': Verdict['date']}
    return JsonResponse(result)
        

# Test mongodb
# client = MongoClient('140.120.13.244', 27018)
# Edge = client.Law.Edge
# List = list( Edge.find({'From Name': '許湘湄'}) )
# # for n in List:
# #     if ('楊子丘' == n['Name'] ):
# #         print('YES')
# print(len(List))
# print(List)

