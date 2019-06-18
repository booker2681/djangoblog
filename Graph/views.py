from django.shortcuts import render, redirect
from django.template.loader import get_template
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
import networkx as nx

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
    Node = list(client.Law.Node.find({}))
    result = []

    for n in Node:
        if(prisoner in n['Name']):
            result.append(n['Name'])

    result = {'prisoner': result}
    return JsonResponse(result)

@csrf_exempt
def get_graph_data(request):
    print(request.POST)
    prisoner = request.POST['prisoner']
    level = request.POST['level']

    # global Node, Link, Edge
    Node = [] # Graph node
    Link = [] # Graph edge
    Target = [prisoner] # 現在level要找的node
    haveFindNode = [] # 曾經找過的node
    Edge = {} # 所有node的edge

    for l in range(int(level)): 
        for t in Target:
            get_node(t, Node, Edge)
            haveFindNode.append(t)
        Target = []
        for n in Node: # target為新增的node中 不曾找過的node
            if(n not in haveFindNode): # 曾經找過node 不再是下次target
                Target.append(n)

    get_Edge(Node, Edge, Link)

    Map = []
    for n in Node:
        Map.append({'name': n})

    result = {'Map': Map, 'Link': Link}
    # print(result)

    return JsonResponse(result)

def get_node(prisoner, Node, Edge): # 取得所有鄰居node
    client = MongoClient('140.120.13.244', 27018)
    if(prisoner not in Node):
        Node.append(prisoner)
    if(prisoner not in Edge):
        this_Edge = list( client.Law.Edge.find({'From Name': prisoner}))
        Edge[prisoner] = this_Edge
    else:
        this_Edge = Edge[prisoner]

    for e in this_Edge:
        if(e['To Name'] not in Node):
            Node.append(e['To Name'])

def get_Edge(Node, Edge, Link): # 取得所有node的edge
    client = MongoClient('140.120.13.244', 27018)
    for ni in Node:
        if(ni not in Edge):
            this_Edge = list( client.Law.Edge.find({'From Name': ni}))
            Edge[ni] = this_Edge
        else:
            this_Edge = Edge[ni]
        for e in this_Edge:
            for nj in Node:
                if(e['To Name'] == nj):
                    Link.append({'source': Node.index(e['From Name']), 'target': Node.index(e['To Name']), 'weight': e['Weight']})

@csrf_exempt
def get_shortest_path(request):
    source = request.POST['source']
    target = request.POST['target']

    print(source, target)
    G = nx.Graph()
    client = MongoClient('140.120.13.244', 27018)
    Edge = list(client.Law.Edge.find({}))
    for i, e in enumerate(Edge):
        G.add_edge(e['From Name'], e['To Name'])
        print(i, " ", e['From Name'], " ", e['To Name'])

    Map = []
    Link = []
    try:
        path = nx.shortest_path(G, source = source, target = target)
        for ni, n in enumerate(path):
            Map.append({'name': n})
            if(ni!=len(path)-1):
                Link.append({'source': ni, 'target': ni+1})
    except:
        path = []
        Map = [{'name': source}, {'name': target}]

    result = {'Map': Map, 'Link': Link}
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

