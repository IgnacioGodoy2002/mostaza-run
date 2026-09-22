"""Blender-native face, hands, clothing and pack refinement; Z up, Y forward.
Details share existing materials and rig weights to bound mobile draw calls.
"""
def refine(bpy, math, objs, roles, mats):
 from math import sin,cos,pi,exp
 import bmesh
 def reg(ob,name,role,key):
  ob.name=name;ob.data.materials.clear();ob.data.materials.append(mats[key])
  bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(ob.data);bm.free()
  for p in ob.data.polygons:p.use_smooth=True
  objs.append(ob);roles[ob.name]=role
  return ob
 def remove(ob):objs.remove(ob);roles.pop(ob.name);bpy.data.objects.remove(ob,do_unlink=True)
 def ell(name,c,s,role,key):
  bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=c);ob=bpy.context.object;ob.scale=s;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
  return reg(ob,name,role,key)
 def loft(name,rings,role,key,n=32):
  verts=[];faces=[]
  for z,rx,ry,cx,cy in rings:
   for i in range(n):a=2*pi*i/n;verts.append((cx+rx*sin(a),cy+ry*cos(a),z))
  for j in range(len(rings)-1):
   for i in range(n):a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
  faces.extend([tuple(reversed(range(n))),tuple((len(rings)-1)*n+i for i in range(n))])
  me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob)
  return reg(ob,name,role,key)
 def stroke(name,points,radius,role,key):
  cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=8;cu.bevel_depth=radius;cu.bevel_resolution=2;sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
  for b,p in zip(sp.bezier_points,points):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
  ob=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(ob);bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
  return reg(bpy.context.object,name,role,key)
 # Keep tailored cap but replace the old ball face and separate hair lumps.
 for ob in list(objs):
  if roles[ob.name]!='head':continue
  if ob.data.materials[0].name=='cf2037':
   for ve in ob.data.vertices:ve.co.x*=.84;ve.co.y*=.84;ve.co.z=1.8+(ve.co.z-1.8)*.82
  else:remove(ob)
 head=loft('Face_anatomical',[(1.570,.052,.068,0,.005),(1.59,.078,.092,0,.028),(1.625,.103,.121,0,.023),(1.66,.136,.141,0,.006),(1.705,.163,.155,0,0),(1.75,.179,.160,0,-.002),(1.79,.178,.158,0,-.005),(1.83,.168,.158,0,-.005),(1.875,.173,.158,0,-.009),(1.92,.164,.145,0,-.015),(1.96,.135,.123,0,-.019),(1.99,.079,.080,0,-.021),(2.0,.018,.023,0,-.021)],'head','c98f68',48)
 for ve in head.data.vertices:
  x,y,z=ve.co
  if y>0:ve.co.y+=-.015*exp(-((abs(x)-.069)/.036)**2-((z-1.819)/.024)**2)+.010*exp(-((abs(x)-.105)/.047)**2-((z-1.752)/.037)**2)+.010*exp(-(x/.063)**2-((z-1.697)/.030)**2)
 loft('Nose_bridge',[(1.725,.013,.010,0,.156),(1.741,.030,.024,0,.171),(1.76,.023,.035,0,.174),(1.79,.014,.026,0,.160),(1.831,.011,.012,0,.148),(1.854,.003,.003,0,.146)],'head','c98f68',24)
 for side in [-1,1]:
  ell('Ear_helix',(side*.176,-.006,1.776),(.025,.038,.054),'head','c98f68')
  stroke('Ear_inner',[(side*.188,.020,1.801),(side*.195,.026,1.78),(side*.189,.022,1.755)],.003,'head','68412b')
  ell('Eye_white',(side*.068,.144,1.816),(.029,.009,.013),'head','fff3df')
  ell('Iris',(side*.067,.153,1.816),(.010,.004,.010),'head','68412b')
  ell('Pupil',(side*.067,.157,1.816),(.0048,.002,.0065),'head','242936')
  ell('Eye_glint',(side*.064,.159,1.820),(.0022,.0015,.0022),'head','fff3df')
  stroke('Upper_eyelid',[(side*.038,.146,1.816),(side*.064,.155,1.830),(side*.095,.139,1.819)],.004,'head','c98f68')
  stroke('Lower_eyelid',[(side*.038,.146,1.815),(side*.065,.153,1.804),(side*.095,.139,1.819)],.0026,'head','c98f68')
  stroke('Eyebrow',[(side*.036,.147,1.853),(side*.064,.157,1.858),(side*.097,.137,1.850)],.005,'head','68412b')
  ell('Nostril',(side*.016,.186,1.740),(.006,.003,.0035),'head','68412b')
 stroke('Lip_line',[(-.042,.147,1.698),(-.016,.164,1.692),(0,.166,1.693),(.018,.162,1.694),(.043,.147,1.702)],.0028,'head','68412b')
 stroke('Lower_lip',[(-.029,.156,1.690),(0,.166,1.685),(.030,.154,1.693)],.004,'head','c98f68')
 # Continuous hair cap with a tapered hairline and combed relief.
 verts=[];faces=[];n=56;rows=12
 for j in range(rows):
  t=j/(rows-1)
  for i in range(n):
   a=2*pi*i/n;low=1.739+.145*max(0,cos(a))+.012*sin(a*3);z=low+(1.976-low)*t;ridge=.0025*sin(a*31+t*4)*(1-t)
   verts.append(((.178*(1-.24*t*t)+ridge)*sin(a),-.012+(.161*(1-.24*t*t)+ridge)*cos(a),z))
 for j in range(rows-1):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
 me=bpy.data.meshes.new('Hair_shell');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('Hair_shell',me);bpy.context.collection.objects.link(ob);reg(ob,'Sculpted_hair','head','68412b')
 for side in [-1,1]:
  for i in range(4):
   a=side*(.55+i*.23);stroke('Combed_lock',[(.158*sin(a),.154*cos(a),1.915),(.174*sin(a+.08),.157*cos(a+.08),1.86),(.168*sin(a+.14),.150*cos(a+.14),1.81)],.004,'head','805139')
 # Replace mitten ends with anatomical palms and relaxed curled fingers.
 for side,label in [(-1,'L'),(1,'R')]:
  for ob in list(objs):
   if roles[ob.name]=='fore_'+label and max(v.co.z for v in ob.data.vertices)<.94:remove(ob)
  x=side*.32
  loft('Palm_'+label,[(.795,.022,.020,x,.003),(.812,.039,.024,x,.002),(.848,.042,.025,x,0),(.885,.030,.024,x,0),(.913,.026,.026,x,0)],'hand_'+label,'c98f68',24)
  for i in range(4):
   fx=x+(i-1.5)*.018;stroke('Finger_'+label,[(fx,-.008,.825),(fx,.005,.788+abs(i-1.5)*.003),(fx,.027,.795),(fx,.031,.820)],.009,'hand_'+label,'c98f68')
  stroke('Thumb_'+label,[(x-side*.034,.008,.872),(x-side*.052,.025,.844),(x-side*.034,.037,.823)],.013,'hand_'+label,'c98f68')
  stroke('Sleeve_stitch_'+label,[(x-.069,.028,1.185),(x,.078,1.18),(x+.069,.028,1.185)],.0026,'upper_'+label,'efdfbd')
  x=side*.15
  stroke('Cargo_pocket_'+label,[(x+side*.094,-.076,.83),(x+side*.117,-.045,.78),(x+side*.111,-.046,.685),(x+side*.080,-.089,.68)],.0035,'thigh_'+label,'242936')
  for z in [.817,.805]:stroke('Pocket_flap_'+label,[(x+side*.082,-.086,z),(x+side*.121,-.041,z-.013)],.004,'thigh_'+label,'242936')
 for ob in objs:
  role=roles[ob.name];key=ob.data.materials[0].name
  if role.startswith('shin_'):
   for ve in ob.data.vertices:
    x,y,z=ve.co
    if z<.24 and y>.11:ve.co.z-=.020*min(1,(y-.11)/.13)*max(0,1-abs(z-.17)/.09)
  if key=='cf2037' and role=='spine':
   for ve in ob.data.vertices:
    x,y,z=ve.co;ve.co.y+=exp(-((z-1.05)/.10)**2)*.006*sin(x*43+z*31)*(1 if y>0 else -1)
 def linear(c):return c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4
 mats['dfad48'].node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=tuple(linear(c) for c in (.78,.055,.10))+(1,)

 # Remove legacy flat lapels, floating hip stitching and hard rectangular side piping.
 for ob in list(objs):
  role=roles[ob.name];key=ob.data.materials[0].name
  zs=[p.co.z for p in ob.data.vertices];xs=[p.co.x for p in ob.data.vertices]
  if role=='spine' and key=='fff3df' and ((max(zs)<1.02 and min(zs)>.78) or (1.37<min(zs)<1.47 and max(zs)<1.55) or (max(xs)-min(xs)<.03 and max(zs)-min(zs)>.3)):
   remove(ob)
 # Soft triangular folded polo collar, lying against the chest.
 for side in [-1,1]:
  me=bpy.data.meshes.new('Collar_fold');me.from_pydata([(side*.025,.130,1.535),(side*.12,.119,1.526),(side*.106,.196,1.425),(side*.036,.173,1.477)],[],[(0,1,2,3)]);me.update()
  ob=bpy.data.objects.new('Collar_fold',me);bpy.context.collection.objects.link(ob)
  reg(ob,'Collar_fold','spine','efdfbd')
  bpy.context.view_layer.objects.active=ob;ob.select_set(True)
  mod=ob.modifiers.new('Cloth thickness','SOLIDIFY');mod.thickness=.006;bpy.ops.object.modifier_apply(modifier=mod.name)
  mod=ob.modifiers.new('Soft collar edge','BEVEL');mod.width=.005;mod.segments=3;bpy.ops.object.modifier_apply(modifier=mod.name)
  ob.select_set(False)
 # Replace balloon-shaped sneaker bodies and soles with longitudinal shoe sections.
 for side,label in [(-1,'L'),(1,'R')]:
  for ob in list(objs):
   if roles[ob.name]!='shin_'+label:continue
   key=ob.data.materials[0].name;zs=[p.co.z for p in ob.data.vertices]
   if key!='c98f68' and max(zs)<.26:remove(ob)
  loft('Sock_'+label,[(.17,.057,.061,side*.15,0),(.255,.061,.065,side*.15,0)],'foot_'+label,'efdfbd',24)
  for sole,key in [(False,'fff3df'),(True,'242936')]:
   verts=[];faces=[];n=20
   for y,rx,zc,rz in [(-.100,.045,.13,.064),(-.075,.075,.13,.080),(0,.083,.125,.075),(.10,.093,.107,.057),(.19,.089,.091,.041),(.247,.046,.082,.029),(.26,.004,.078,.008)]:
    if sole:zc=.043;rz=.015;rx*=1.025
    for i in range(n):
     a=2*pi*i/n;verts.append((side*.15+rx*cos(a),y,zc+rz*sin(a)))
   for j in range(6):
    for i in range(n):a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
   faces.extend([tuple(reversed(range(n))),tuple(6*n+i for i in range(n))])
   me=bpy.data.meshes.new('Shoe');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('Shoe',me);bpy.context.collection.objects.link(ob);reg(ob,'Sneaker_sole' if sole else 'Sneaker_upper','foot_'+label,key)
  for k in range(3):
   y=.037+k*.029;stroke('Shoelace',[(side*.15-.047,y,.180-k*.009),(side*.15,y+.006,.186-k*.009),(side*.15+.047,y,.180-k*.009)],.004,'foot_'+label,'efdfbd')
