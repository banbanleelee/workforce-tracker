import React, { createContext, useState, useContext } from 'react';

// Create Context
const ProviderContext = createContext();

// Custom Hook for easier consumption
export const useProviderContext = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProviderContext must be used within a ProviderContextProvider');
  }
  return context;
};

// Context Provider Component
const ProviderContextProvider = ({ children }) => {
  // Static TINs and NPIs arrays
  const staticTINs = ['134246188', '200073131', '200073189', '263328413'];
  // const staticNPIs = [];
  const staticNPIs = ['1033583836', '1093349821', '1518972322', '1427028919', '1902079775', '1508869645', '1073682159', '1689693970', '1417906660', '1235255605', '1245436823', '1336131143', '1750303855', '1427051796', '1497751747', '1295708964', '1891728382', '1760616031', '1851474365', '1134157225', '1598949281', '1194770727', '1629313739', '1609030774', '1982677191', '1619037066', '1962477539', '1144380593', '1043217615', '1245450295', '1962772871', '1114034006', '1336184993', '1548203888', '1982676227', '1487978789', '1215126438', '1932145109', '1811947062', '1619944824', '1588644520', '1972532539', '1356366991', '1942398656', '1568425650', '1265458186', '1619911054', '1942385794', '1215018767', '1760567515', '1114958493', '1598285157', '1699929562', '1053472084', '1649553405', '1982640256', '1770025652', '1043883028', '1225662927', '1689695652', '1417972050', '1710061981', '1427149269', '1740222009', '1487681524', '1669568564', '1902904253', '1700972601', '1497202857', '1891718375', '1609231307', '1972968675', '1326403023', '1255373858', '1114310299', '1437581469', '1518394311', '1881910495', '1891727079', '1164795795', '1245257088', '1417016973', '1285745364', '1578126439', '1093044216', '1275563918', '1649617705', '1427273598', '1730409400', '1083630610', '1750790762', '1457833014', '1346746385', '1487300521', '1629848908', '1053505909', '1023126232', '1639132269', '1730279670', '1548222490', '1700880697', '1366435927', '1306850508', '1841482270', '1770549115', '1245551134', '1831624428', '1386989820', '1568024537', '1326484536', '1154598068', '1104817063', '1902876162', '1548449234', '1386635548', '1134320328', '1154853414', '1457615221', '1487833505', '1790786846', '1528098720', '1447251715', '1578556098', '1750608915', '1669463378', '1265518377', '1700872710', '1174793541', '1285690529', '1801857073', '1306035498', '1164474615', '1902008170', '1962933325', '1093152316', '1801891288', '1801891288', '1609867472', '1881987303', '1598966509', '1336438522', '1417116211', '1891753729', '1659489581', '1659582286', '1699755819', '1073502233', '1174533194', '1780644351', '1336130046', '1346636636', '1245439702', '1972553030', '1295197754', '1780993907', '1235148461', '1740499532', '1134584543', '1316041064', '1669785788', '1992759096', '1275819526', '1063611598', '1255312591', '1477504223', '1871574186', '1417031238', '1669790119', '1134532286', '1538165113', '1093729287', '1801890413', '1386635019', '1669416459', '1760826341', '1033374301', '1407085376', '1770849069', '1518165919', '1073742359', '1871948125', '1871948125', '1386850832', '1033189246', '1003809435', '1063478766', '1134241284', '1841209426', '1780654913', '1811945231', '1336109909', '1487858973', '1245642073', '1881646156', '1316903768', '1962408047', '1154007565', '1134898943', '1598081911', '1962450783', '1326484536', '1447224472', '1114926904', '1992913941', '1346235975', '1912991324', '1457316341', '1427247790', '1801898614', '1699838979', '1760493753', '1407804578', '1124155569', '1285282186', '1093944092', '1467649368', '1609015528', '1003893199', '1972584217', '1902068158', '1245221993', '1164437455', '1164413589', '1164413589', '1811124688', '1699766378', '1144210022', '1871574871', '1730381658', '1356332506', '1417163999', '1336466622', '1548429681', '1861454696', '1558399899', '1851525406', '1114919503', '1851667109', '1376713727', '1700241718', '1154512705', '1861843138', '1104489848', '1669435004', '1013965359', '1245278589', '1194938324', '1386807493', '1295927739', '1003031212', '1790756450', '1790756450', '1477086718', '1821290362', '1821455262', '1154617496', '1316109994', '1336120336', '1578100319', '1841637436', '1376500769', '1265420020', '1962408849', '1255335758', '1477948032', '1992984512', '1871776757', '1336495134', '1275624397', '1639129125', '1730279670', '1962646745', '1871582791', '1992956809', '1275503971', '1780654889', '1073571949', '1710032032', '1003807645', '1992904379', '1083605240', '1457553398', '1821058496', '1366588816', '1740697192', '1871949883', '1588155949', '1902291412', '1629023080', '1588636831', '1447755830', '1518940246', '1316920259', '1124067269', '1073964268', '1659354694', '1760486005', '1407852585', '1518118157', '1598919243', '1376596346', '1386693331', '1346227352', '1265020739', '1487691655', '1447296108', '1194783027', '1487734646', '1225084189', '1366425209', '1710120548', '1033640545', '1790763985', '1932280138', '1407032097', '1699948976', '1184942286', '1750370755', '1871586727', '1073802674', '1285893487', '1033383351', '1073963732', '1689601239', '1215165279', '1134388689', '1912966318', '1831191246', '1457408254', '1184718496', '1407086127', '1811189681', '1326260837', '1841347655', '1407012602', '1174519813', '1013175488', '1912194283', '1568412930', '1053424382', '1619053998', '1538322003', '1578887725', '1073975751', '1851577183', '1548553936', '1245211242', '1598074544', '1013238161', '1356325419', '1992739635', '1346223989', '1053315648', '1760590962', '1316943491', '1851389514', '1891729786', '1235199878', '1497929319', '1700851243', '1215433966', '1043258270', '1750383980', '1285822924', '1861192064', '1154304699', '1033192570', '1457672685', '1013002880', '1073772067', '1487973087', '1104053552', '1992930309', '1487753091', '1437840956', '1750034625', '1598077497', '1083903421', '1447416508', '1841261906', '1821309410', '1407850449', '1699194928', '1871955096', '1265591804', '1356631287', '1750541892', '1891177911', '1073571964', '1194796391', '1063712826', '1225034309', '1982947834', '1891775789', '1528269917', '1134125214', '1720310089', '1851501704', '1003128703', '1982691689', '1336142488', '1346488061', '1386829984', '1477879567', '1750341327', '1588667901', '1386645695', '1457334914', '1881627966', '1326030362', '1710312236', '1033537105', '1336467059', '1033853031', '1407055973', '1295716645', '1568717544', '1265672018', '1497778054', '1447211818', '1356545818', '1598785966', '1023213089', '1558393850', '1013941590', '1003804485', '1003804485', '1336132844', '1306220900', '1104910009', '1952509606', '1053554717', '1578543799', '1508087297', '1942588918', '1508824608', '1699745638', '1669432290', '1528059227', '1659510337', '1811187909', '1043595713', '1144234691', '1770542854', '1811301021', '1720286594', '1619959863', '1083211809', '1376533158', '1538212345', '1215066949', '1639239171', '1376533158', '1528044005', '1346327806', '1821435157', '1962788125', '1932587847', '1457601643', '1750865069', '1700296100', '1427699255', '1700151040', '1265782452', '1205263423', '1497053912', '1134417439', '1083118145', '1194754358', '1093231268', '1851847693', '1346753118', '1144698689', '1902453970', '1093180804', '1124543442', '1306226295', '1629404637', '1063762250', '1619347895', '1285178509', '1174989404', '1194237867', '1417178120', '1306202098', '1144732165', '1801261615', '1427421726', '1801277819', '1326535410', '1467433292', '1326527680', '1972503464', '1366573263', '1528298395', '1275664179', '1912038811', '1659318558', '1861739161', '1285657916', '1033549076', '1205505666', '1598740508', '1518118538', '1023219482', '1568485571', '1073878849', '1831435106', '1558917070', '1861477861', '1760731699', '1720398977', '1881247484', '1255583670', '1942286554', '1629229141', '1710160924', '1003170820', '1679574792', '1487610242', '1942472253', '1871533612', '1285941484', '1093456162', '1811628563', '1447689732', '1932320876', '1003200601', '1134509276', '1568684769', '1801525407', '1497475479', '1063666592', '1376764373', '1215313416', '1649256397', '1922304179', '1740953520', '1316911464', '1235175993', '1154317105', '1184912719', '1992706253', '1548256597', '1003045139', '1407888225', '1336108778', '1922008648', '1629013461', '1023202058', '1831197292', '1558513507', '1831801877', '1306575998', '1568463982', '1932413002', '1952730871', '1710909585', '1376161075', '1831499029', '1396201307', '1861022873', '1629596770', '1851470553', '1194739912', '1093032377', '1134159940', '1114931938', '1265440747', '1508401548', '1154331841', '1073711800', '1770197345', '1396828364', '1972747418', '1366823254', '1053582270', '1891970620', '1174631014', '1811291909', '1285970012', '1972608248', '1164253373', '1205213055', '1861511206', '1528377678', '1831209949', '	1104937218', '1558624239', '1174989859', '1174574842', '1972586188', '1114996303', '1467401224', '1477505980', '1760443782', '1922069624', '1447635461', '1679533418', '1770768210', '1225291172', '1659569507', '1912342908', '1982132825', '1639339153', '1023180858', '1205236718', '1427203819', '1629039342', '1346201175', '1093088999', '1194748160', '1932285111', '1588687552', '1487676094', '1427075860', '1649317660', '1164703922', '1992916449', '1891736484', '1093753345', '1023051604', '1275574790', '1497138010', '1386274900', '1649510561', '1538104138', '1013964667', '1548625668', '1598081697', '1124084264', '1922475250', '1518219930', '1750834586', '1699390310', '1912211848', '1578056040', '1528551256', '1073159695', '1144880642', '1104057629', '1962895623', '1073945002', '1295964971', '1306088687', '1285104216', '1083708838', '1700498706', '1790837565', '1215552542', '1104931104', '1376615716', '1720533730', '1811122815', '1457327652', '1154396356', '1609813823', '1669598587', '1922103373', '1629015094', '1881012326', '1548585870', '1912975129', '1972009611', '1962662130', '1497051403', '1518212513', '1386276848', '1700110582', '1508807009', '1730775107', '1306885777', '1497378251', '1821400979', '1073762324', '1700839669', '1326608159', '1780085969', '1285712984', '1881185338', '1174184576', '1518319193', '1659824381', '1487615118', '1417472317', '1710309893', '1083129407', '1508879784', '1457378895', '1801833777', '1821063439', '1871536235', '1952622243', '1316169253', '1194959387', '1033536354', '1780142190', '1356468052', '1710486931', '1629011226', '1699790576', '1659537652', '1639616097', '1831719301', '1053836544', '1487696472', '1861961443', '1730124900', '1689939803', '1912490608', '1174583520', '1245584390', '1093796674', '1184654659', '1639111719', '1629038732', '1447405790', '1922108398', '1477913721', '1467903310', '1861741522', '1730483090', '1801837802', '1851314827', '1134562051', '1548287972', '1346449873', '1407874290', '1104841857', '1376566349', '1487671574', '1578581369', '1003250887', '1134659501', '1629506068', '1962598847', '1154776276', '1720174535', '1811411655', '1871143131', '1639502602', '1093253213', '1487009858', '1750997367', '1558338418', '1679828982', '1063967743', '1285278911', '1942717707', '1871947481', '1285242263', '1922195858', '1770505703', '1154340180', '1194067280', '1891717807', '1417926585', '1194786640', '1043477672', '1124092192', '1760409114', '1144644063', '1710593231', '1083267470', '1891880746', '1871803080', '1700959525', '1255349148', '1316960388', '1902063092', '1922129923', '1235187709', '1356775209', '1356965214', '1689153330', '1548740095', '1154343986', '1376571372', '1952577447', '1699128058', '1619038270', '1548676612', '1154849875', '1396801171', '1205180528', '1346652849', '1750308086', '1043620628', '1285655035', '1477575298', '1225051295', '1528201134', '1881905008', '1972753275', '1902867914', '1366655839', '1366920522', '1588150437', '1467685909', '1982723516', '1285061465', '1922243914', '1174925168', '1528198579', '1740815281', '1174857650', '1629174719', '1740207810', '1609897438', '1972663987', '1215410295', '1508875527', '1699327932', '1346849031', '1992353171', '1629620349', '1053800136', '1386260776', '1760628572', '1578998142', '1164047288', '1093770448', '1376867051', '1770543852', '1487073482', '1871528869', '1497903678', '1801821897', '1942593488', '1154356236', '1679890255', '1164457230', '1023043106', '1952336034', '1275825259', '1194794925', '1003841008', '1891014247', '1962437954', '1114952298', '1508203258', '1114550191', '1265430383', '1992057707', '1669947776', '1407009251', '1477862696', '1659815884', '1184665184', '1386119352', '1366483364', '1063763654', '1609429752', '1801414271', '1346644812', '1366841454', '1639602162', '1790061216', '1952674517', '1457392458', '1235456914', '1033697735', '1508372210', '1528093440', '1811320161', '1669930939', '1982053963', '1609421734', '1417922519', '1811528235', '1710436480', '1003413717', '1932532546', '1376060871', '1326108416', '1134147101', '1083614218', '1497764435', '1568483394', '1962749374', '1699921460', '1609165463', '1609882752', '1568737955', '1811276298', '1578168928', '1396137956', '1962001156', '1659392488', '1982953915', '1295186377', '1912176140', '1568901999', '1053928978', '1942860705', '1225653801', '1154426625', '1154794659', '1639130362', '1700027026', '1518909738', '1760424741', '1518909670', '1063617140', '1275804015', '1396713269', '1215201744', '1508832783', '1235484007', '1003912536', '1790278075', '1164709960', '1720027196', '1902830326', '1861748030', '1508426164', '1336434570', '1134147978', '1194748129', '1265457550', '1821010851', '1366465296', '1669653523', '1265981716', '1619532611', '1548740988', '1932734274', '1366603797', '1891019501', '1508242173', '1922501188', '1821330275', '1013387497', '1982210829', '1770501520', '1184987117', '1205821063', '1780694760', '1134166929', '1417995515', '1518999358', '1467434290', '1851898159', '1124286448', '1023576444', '1760940183', '1306155734', '1750346185', '1689974438', '1649792854', '1043878929', '1154980027', '1154643815', '1578525713', '1073987830', '1710953930', '1841399672', '1821132374', '1285600486', '1265408496', '1639387293', '1043638505', '1194917658', '1053607945', '1023585734', '1033185210', '1205007465', '1669910857', '1407112709', '1588036156', '1134427537', '1679030506', '1730143892', '1538624390', '1639693872', '1811090434', '1053757823', '1104203496', '1992732218', '1265649164', '1720263619', '1235170762', '1659661452', '1528013836', '1851814909', '1316235047', '1023473543', '1730544131', '1437609591', '1285890988', '1558590323', '1124630157', '1346733664', '1417400193', '1558349571', '1437456357', '1811340748', '1740706639', '1578583308', ''1003834078', '1760429476', '1457388779', '1558389528', '1427425990', '1508870320', '1811919947', '1699121285', '1316313257', '1245744960', '1780845362', '1306125570', '1942463831', '1710964812', '1538544242', '1962889352', '1477940898', '1720395775', '1013016096', '1750862801', '1659330595', '1114307964', '1093201956', '1053619437', '1043552581', '1245711340', '1730292301', '1447760814', '1144275629', '1679674956', '1568664613', '1619915170', '1982972923', '1346573540', '1962470567', '1457471641', '1376022327', '1265751671', '1861770893', '1053873083', '1003578287', '1083710651', '1962547653', '1336284264', '1528561453', '1740590454', '1225673809', '1972948875', '1215379904', '1588248249', '1164099198', '1598784720', '1194744326', '1720169147', '1619135464', '1336113299', '1124500939', '1235663550', '1497901987', '1639303589', '1912089590', '1609064146', '1952863649', '1841357563', '1104890284', '1407929276', '1790755585', '1609933308', '1487644480', '1770672982', '1942431408', '1033573530', '1225422405', '1760634505', '1184011991', '1598249211', '1619984150', '1316174873', '1366098048', '1689839482', '1902868011', '1962523639', '1568488435', '1275590481', '1144575168', '1356874598', '1083729446', '1992888754', '1972576320', '1497729834', '1396271292', '1396755039', '1184638702', '1427000165', '1760669865', '1578818506', '1508361841', '1427697002', '1285624882', '1982235370', '1902895824', '1003901117', '1982679064', '1619344223', '1154383701', '1982643706', '1134658420', '1902874043', '1326248105', '1174990501', '1063623700', '1679912562', '1588092910', '1003878877', '1043871494', '1912978065', '1124402722', '1437445764', '1669436911', '1093185167', '1205045093', '1366484255', '1124528237', '1033599931', '1326159120', '1083097869', '1306860788', '1750397899', '1659620631', '1700851284', '1336261916', '1497083125', '1720036411', '1831652023', '1093180630', '1164733390', '1538812714', '1003131988', '1548251010', '1194009514', '1952329385', '1336361187', '1356550610', '1427344753', '1891180113', '1487917159', '1578947800', '1841590908', '1649267790', '1073692174', '1568513869', '1255686747', '1184610313', '1114247921', '1013900604', '1114223690', '1124095542', '1063411601', '1770831588', '1548255920', '1689619678', '1952334930', '1427156900', '1851664445', '1891726451', '1922668045', '1922171784', '1740353507', '1013468883', '1811401854', '1598755191', '1205837150', '1851354179', '1679652762', '1669067377', '1609232495', '1740639327', '1518930841', '1265861439', '1366987844', '1427407022', '1821474099', '1194712505', '1265960306', '1558779348', '1255391165', '1538122833', '1760795108', '1467541078', '1457501645', '1609432699', '1023242179', '1437535614', '1174533814', '1801859202', '1013956044', '1164484911', '1952396350', '1558428326', '1639359342', '1326309121', '1871107029', '1124576616', '1104265909', '1467405274', '1902530462', '1316935000', '1154326932', '1174549042', '1043238470', '1851387310', '1417020272', '1609937499', '1255341988', '1457733842', '1225411846', '1063939619', '1245675198', '1215483441', '1306875117', '1982661641', '1104972223', '1558434316', '1306298575', '1598714479', '1417922469', '1528257268', '1851342356', '1063501757', '1174039481', '1962403766', '1154322899', '1245231984', '1134396153', '1962763771', '1780847947', '1659639847', '1265783260', '1932116209', '1316132202', '1790711851', '1982683488', '1447258843', '1760700579', '1457610917', '1053880161', '1194245951', '1497785661', '1033475330', '1962063438', '1972819811', '1942314356', '1457647653', '1134353881', '1356343214', '1962662684', '1801152079', '1104803527', '1326029703', '1487857942', '1144411760', '1386745321', '1164538914', '1295945152', '1003808064', '1750733119', '1568805430', '1720589310', '1275512006', '1114460516', '1396746152', '1649570102', '1124158704', '1124158704', '1508816950', '1033564414', '1174059208', '1447793708', '1538529912', '1053771477', '1164674800', '1649219536', '1750974960', '1497424717', '1366436123', '1134650708', '1538135868', '1598232035', '1225347735', '1841659810', '1578004651', '1003367970', '1134400930', '1871074344', '1972242980', '1992277131', '1952300477', '1285831396', '1619193505', '1295732188', '1598944381', '1437900800', '1568229003', '1114179181', '1821512138', '1093712887', '1609875236', '1295720365', '1629698808', '1518208289', '1831941343', '1366407603', '1669576997', '1902897937', '1306897004', '1457772402', '1508950171', '1205844495', '1003821729', '1003061797', '1477638260', '1932130952', '1952411233', '1447585153', '1003061797', '1568617256', '1467779124', '1437461449', '1720190002', '1548571227', '1912233867', '1144555020', '1457366189', '1245259878', '1063757227', '1063757227', '1619915170', '1508872482', '1518962109', '1922004183', '1780680942', '1487662961', '1952411233', '1932130952', '1447585153', '1568617256', '1467779124', '1437461449', '1720190002', '1548571227', '1912233867', '1144555020', '1861722688', '1396060604', '1619292927', '1134622491', '1174893614', '1700878279', '1619903705', '1598230724', '1447664412', '1689129116', '1891320172', '1114589256', '1700827557', '1346888161', '1881820256', '1376686329', '1285258731', '1356696371', '1477665925', '1780667808', '1699959593', '1801451133', '1649698366', '1124343934', '1063663102', '1447671920', '1588614895', '1700914306', '1093091381', '1144857012', '1881134500', '1104185065', '1568615219', '1245280148', '1063627115', '1194716159', '1407265515', '1356744890', '1215482195', '1366890097', '1982922001', '1679772677', '1558697177', '1154654515', '1487670717', '1265963698', '1679860597', '1295173821', '1942590054', '1780100917', '1023240108', '1699316430', '1225046139', '1134495104', '1699100826', '1396995890', '1568994176', '1073073144', '1568443398', '1912587882', '1639142508', '1487944484', '1477908234', '1487670717', '1982922001', '1134622491', '1598230724', '1285258731', '1093091381', '1356744890', '1881810596', '1447423322', '1780100917', '1487707188', '1801816814', '1639261555', '1316944697', '1639724099', '1023012010', '1396749867', '1750385357', '1538158571', '1295098416', '1104273549', '1821300013', '1881810596', '1437137155', '1164635173', '1457313314', '1518426717', '1770518128', '1871555649', '1669444246', '1700028131', '1770205023', '1457391773', '1770740854', '1417915950', '1720228778', '1679763791', '1851326557', '1881676971', '1427098797', '1871545269', '1225290380', '1407145683', '1366885840', '1740252725', '1265455018', '1386256402', '1720499163', '1003802968', '1881030997', '1891040689', '1316926272', '1447423322', '1609010578', '1467615252', '1922366657', '1780029215', '1619976230', '1144276338', '1508164856', '1568652147', '1891392999', '1952626079', '1407824972', '1619437779', '1699734061', '1801383823', '1912439498', '1972775690', '1114199221', '1205889029', '1063616738', '1821475963', '1093071060', '1689670374', '1174572580', '1316973613', '1053769943', '1285185231', '1265929723', '1083748966', '1144302720', '1699860585', '1518905678', '1568879435', '1447387857', '1427616986', '1578875225', '1326265273', '1285282319', '1659509644', '1306481031', '1740411164', '1962571927', '1881855948', '1750608915', '1417161704', '1609821016', '1295735058', '1942897087', '1306035498', '1235191826', '1881663284', '1790261618', '1831189877', '1467090829', '1417421470', '1750677118', '1205814092', '1417480302', '1114929130', '1417164476', '1851377196', '1750336236', '1699764878', '1922330844', '1992703862', '1922066778', '1871767152', '1013583939', '1720293608', '1457029811', '1285802488', '1609359215', '1255930426', '1437367133', '1083620843', '1043288483', '1124319439', '1871114058', '1760469407', '1265931679', '1194905737', '1720056823', '1700212271', '1083672760', '1174000178', '1194777292', '1093008336', '1417669037', '1689221905', '1730344458', '1376631374', '1649216342', '1760481667', '1164058277', '1023370921', '1801847603', '1821654880', '1265478374', '1912049362', '1205195435', '1952423071', '1124101597', '1972108314', '1225144231', '1083966113', '1326345042', '1467448100', '1457358749', '1982656005', '1225502859', '1417027640', '1205804283', '1952359549', '1548242118', '1033413877', '1508092867', '1619963543', '1902864564', '1366075673', '1447203054', '1316362817', '1922207588', '1588050116', '1376933531', '1316995699', '1013995646', '1407236144', '1164958013', '1366441743', '1023194198', '1699765529', '1447455720', '1245217728', '1114926060', '1598231623', '1891184453', '1144278243', '1396735908', '1639745581', '1750351664', '1528095262', '1841277589', '1922034156', '1285308528', '1548367204', '1821415043', '1619222544', '1457319931', '1750932877', '1033383351', '1871931543', '1851840870', '1568513059', '1811005374', '1437116985', '1780632828', '1508856436', '1699241034', '1407884349', '1679659742', '1003875295', '1316587421', '1619195294', '1316948995', '1205843810', '1225072648', '1972751105', '1295784262', '1710143847', '1730458571', '1427598333', '1114168689', '1811280241', '1184980260', '1093715385', '1902407497', '1871527937', '1275910960', '1558829879', '1912950502', '1831281765', '1518631183', '1669764064', '1982006078', '1740896448', '1538127238', '1780872515', '1174813489', '1568446870', '1730318015', '1881163046', '1952310070', '1093306169', '1225034622', '1174033500', '1497998520', '1700855822', '1750608246', '1386945905', '1346227048', '1477561074', '1891012738', '1124651468', '1760767412', '1174503635', '1972613727', '1538353073', '1609808831', '1417174699', '1861477721', '1700881422', '1871541979', '1770894354', '1598766925', '1891968301', '1447252135', '1396951299', '1437151347', '1255333167', '1134330061', '1073515987', '1831173269', '1982606893', '1821209370', '1790787604', '1861525560', '1518255942', '1558652826', '1639148232', '1003012352', '1649815440', '1639313158', '1831796762', '1538627617', '1124423165', '1487380499', '1003058454', '1346530904', '1215333265', '1528581329', '1275005183', '1437431210', '1497927040', '1457325573', '1609864883', '1124092945', '1972577161', '1144406927', '1255102604', '1336910785', '1346011798', '1487628301', '1609153329', '1649244567', '1427017813', '1790744175', '1891754271', '1982853271', '1992765986', '1740254572', '1487629044', '1952518029', '1972694982', '1497720999', '1972578771', '1073588646', '1235104738', '1043239338', '1871568329', '1487629986', '1184699241', '1174663199', '1386619708', '1376518357', '1811057029', '1609871680', '1881793990', '1619065273', '1316179963', '1053496240', '1821285073', '1972654762', '1134300080', '1821279720', '1780865634', '1962595942', '1528151586', '1073675583', '1770645905', '1073675583', '1639352347', '1477595056', '1366539629', '1689669418', '1255526265', '1518155811', '1982681672', '1528253523', '1396762027', '1386823854', '1801842927', '1720262405', '1043497019', '1790738359', '1205013273', '1396798930', '1750529814', '1154415305', '1497727119', '1144416587', '1003888710', '1194790808', '1346386604', '1659344133', '1780658062', '1215287156', '1477802387', '1740398734', '1679816342', '1710952130', '1386614832', '1811962210', '1386618783', '1003888595', '1295714301', '1154301240', '1548249675', '1053391169', '1275764334', '1821233925', '1255311635', '1487885182', '1992785232', '1689646937', '1609953942', '1316919574', '1952373086', '1780656801', '1922070911', '1801869292', '1033181862', '1689806234', '1427020213', '1043282775', '1164459137', '1417959008', '1740252634', '1760419618', '1992777643', '1407829773', '1376863951', '1003889379', '1013980317', '1730152869', '1699748855', '1144293309', '1508839473', '1578748232', '1114922192', '1194718056', '1851516728', '1760445928', '1164414447', '1104899855', '1053364703', '1902429590', '1457174567', '1013085083', '1639691603', '1265568638', '1053805069', '1205018439', '1346570710', '1194753590', '1669213831', '1710492061', '1841637253', '1033938451', '1265772362', '1962504340', '1740297506', '1225252950', '1295397859', '1376844936', '1396138970', '1639511207', '1699076257', '1730480393', '1821399767', '1902107568', '1104286442', '1255579389', '1669569984', '1275536328', '1235510090', '1184622847', '1285678458', '1568899391', '1891882833', '1649294323', '1194859207', '1366824898', '1447215645', '1457470262', '1477516466', '1497833685', '1508916826', '1578502613', '1669566584', '1710942040', '1720102528', '1730213836', '1760447163', '1891468591', '1922063320', '1942266333', '1962497800', '1578741849', '1659366557', '1659548568', '1710094446', '1154315307', '1659949121', '1295464949', '1083633143', '1275874521', '1497755839', '1669472387', '1790298388', '1831199462', '1972640316', '1124305065', '1073511762', '1326401951', '1467793075', '1598006801', '1164763850', '1265430177', '1750380507', '1134129851', '1245571546', '1326389636', '1447250253', '1447597240', '1518967231', '1639434541', '1851632533', '1891036588', '1942348354', '1972519379', '1104822915', '1114268471', '1992700983', '1528309135', '1386647717', '1609855139', '1023486057', '1649793613', '1932440542', '1649273434', '1811435811', '1801826839', '1003264912', '1003496662', '1013788249', '1023867397', '1023875424', '1033685797', '1053774638', '1083296784', '1134880164', '1144477266', '1144683723', '1174197537', '1174282776', '1174346928', '1194337493', '1215398813', '1245812940', '1265687966', '1285395889', '1326620022', '1336245828', '1336637438', '1376104125', '1376382770', '1386256444', '1396357497', '1417521873', '1437535770', '1447021670', '1467034066', '1477135077', '1487015988', '1487234043', '1487236089', '1508227109', '1518709914', '1518720481', '1538829627', '1548870777', '1568044162', '1588801377', '1609458306', '1609639574', '1619559317', '1619634698', '1629454962', '1679934277', '1689037269', '1700247301', '1710348214', '1720243348', '1720652126', '1720660327', '1730540238', '1740991298', '1750742359', '1760062327', '1780266486', '1780353318', '1790177616', '1831838507', '1841948254', '1851942023', '1881230217', '1881268431', '1881304004', '1881356202', '1952762551', '1972989218', '1992389910', '1992576128', ''1346744083', '1578983334', '1174130454', '1952572604', '1285021196', '1891980389', '1134133002', '1306355680', '1437102605', '1407023039', '1164547345', '1902073844', '1437103496', '1538113584', '1407082308', '1861628752', '1780643411', '1053371138', '1962461681', '1003058728', '1578079000', '1841445012', '1407856594', '1982778239', '1760498588', '1942203633', '1447779913', '1508212390', '1235585092', '1437186111', '1639421704', '1053306191', '1003801184', '1790781821', '1225034333', '1942875034', '1760651665', '1528027240', '1720589328', '1699181669', '1811172729', '1609051515', '1861657256', '1871720540', '1306163431', '1477846145', '1609052679	', '1336180173', '1679892913', '1386159853', '1558876037', '1205939345', '1306351887', '1689053050', '1598270076', '1245287697', '1275881179', '1669559928', '1326424144', '1093746380', '1992395388', '1346266319', '1003952805', '1073783692', '1740559848', '1316092976', '1598784555', '1033433495', '1043271034', '1073575064', '1083675185', '1093776288', '1114988375', '1154381028', '1154381978', '1174583363', '1174965008', '1184684995', '1225090525', '1225150709', '1235190224', '1235199019', '1235322850', '1255392601', '1376503953', '1376504480', '1457313934', '1487414082', '1528028362', '1528028701', '1528029204', '1548221641', '1588625750', '1598726770', '1609837996', '1629038815', '1629039730', '1649230475', '1659423986', '1669433074', '1700846920', '1720044589', '1720048606', '1821059619', '1821059817', '1881654416', '1902866783', '1902867005', '1922068204', '1932169810', '1952362121', '1023100260', '1043247448', '1043302292', '1043390537', '1043970742', '1053641704', '1063504322', '1083054555', '1104918325', '1114750676', '1124282652', '1134204449', '1144318684', '1235174426', '1245310721', '1255827093', '1356837199', '1366771859', '1366823403', '1447078209', '1447746284', '1477645646', '1528096914', '1528150786', '1548685316', '1568894350', '1598295610', '1639594401', '1649350075', '1669857934', '1679230551', '1699850990', '1700936325', '1710216205', '1720469869', '1730324955', '1750114898', '1750804514', '1760979504', '1780772236', '1790298412', '1790720985', '1922043744', '1972047710', '1972695278', '1982897716', '1699306241', '1043747462', '1447245014', '1235341363', '1629423504', '1063778777', '1194264309', '1366074338', '1982084620', '1285391011', '1366868572', '1154326379', '1962575860', '1831445576', '1841516960', '1003803032', '1013684349', '1023212131', '1023212248', '1023790524', '1033987326', '1043781990', '1083100291', '1093016800', '1114670080', '1124599089', '1124771076', '1134731227', '1134874514', '1144424029', '1174727382', '1194964379', '1215754775', '1225139249', '1245434372', '1245757665', '1245821875', '1275071482', '1336619063', '1376117176', '1376298687', '1407050396', '1407327364', '1407891575', '1417177536', '1437795465', '1437802303', '1437916608', '1447281845', '1447454558', '1457652265', '1467107771', '1477757383', '1487471090', '1508581489', '1548464845', '1578684593', '1578767687', '1578796421', '1588840946', '1639454499', '1679777874', '1689878787', '1689878803', '1720282635', '1730383555', '1730718131', '1790935815', '1801064886', '1801090774', '1811018831', '1811191034', '1821292939', '1841494812', '1912082645', '1992909865', '1194002741', '1194123810', '1316001787', '1356739577', '1396746228', '1447537535', '1457411381', '1568463289', '1780705004', '1811244411', '1871594481', '1992889604', '1417958331', '1063480531', '1073732376', '1093571515', '1114192358', '1114995677', '1144211301', '1235978834', '1265216402', '1285697532', '1316079247', '1346218724', '1366594665', '1376978999', '1386778926', '1477319903', '1487410908', '1598007213', '1609162098', '1649546094', '1669596094', '1689849200', '1790555217', '1801917364', '1881460855', '1912025404', '1912179219', '1912975038', '1932328192', '1942359385', '1962879494', '1003114992', '1003150798', '1003239096', '1013031301', '1013249796', '1013352137', '1013437755', '1023142122', '1023354156', '1053175299', '1063453553', '1063647394', '1073822029', '1083971485', '1093219370', '1104959055', '1114293818', '1124265236', '1124451182', '1184951634', '1225153984', '1245006311', '1245665371', '1265679179', '1275658692', '1285400747', '1295850923', '1326313735', '1336405471', '1346516895', '1467789313', '1477785756', '1477828788', '1487879177', '1508987447', '1518393560', '1538504238', '1588859466', '1609109099', '1639575400', '1659495133', '1659718922', '1700901436', '1700918877', '1710001292', '1730203506', '1730343922', '1730416801', '1740249465', '1770825390', '1770858938', '1790809531', '1801662366', '1811233075', '1831567445', '1922434307', '1922441773', '1962833343', '1982084307', '1023185477', '1033130547', '1093737082', '1104993930', '1265453765', '1285656272', '1295752954', '1497821359', '1861567182', '1881614071', '1093763757', '1275607772', '1407474844', '1588739338', '1720159338', '1821279936', '1609607712', '1780233320', '1194267625', '1861789992', '1013614700', '1225744287', '1720051832', '1043952435', '1730169616', '1396067963', '1366775124', '1871286906', '1558744417', '1245614114', '1851787790', '1306661947', '1992941108', '1497300172', '1487603601', '1841427143', '1972574275', '1821417239', '1962495465', '1376594168', '1609074681', '1225203896', '1952815805', '1003194093', '1609372689', '1164030797', '1083847826', '1750738522', '1508185398', '1477998052', '1194284760', '1235484429', '1194553560', '1093987257', '1265859243', '1730467499', '1114478179', '1457347270', '1477917474', '1063414480', '1851923775', '1255397139', '1427444561', '1104078138', '1972044170', '1366564197', '1427791367', '1275924805', '1710482922', '1336567700', '1841317526', '1043361298', '1245737113', '1164475398', '1891788386', '1851384846', '1285684282', '1982278925', '1164894242', '1932140696', '1265963540', '1558487330', '1700825825', '1528484565', '1477701407', '1134547615', '1093210684', '1225022569', '1699155234', '1346534583', '1679982193', '1851512875', '1073932406', '1376777433', '1487615514', '1891815320', '1285204750', '1679986236', '1851656300', '1871858415', '1316379431', '1679005995', '1720161854', '1073992863', '1477182004', '1568415321', '1346870128', '1396746517', '1568636991', '1407235005', '1962664722', '1134403967', '1497760979', '1265745038', '1417944125', '1477879948', '1770586984', '1396787362', '1437689692', '1003998642', '1699205104', '1346940749', '1689667594', '1932512142', '1437662475', '1518498732', '1740711621', '1265464622', '1043355712', '1306209986', '1699200436', '1104238930', '1457695405', '1083814982', '1699752543', '1588672794', '1316613276', '1942697461', '1427507995', '1144515925', '1043492895', '1831305325', '1902890569', '1861653701', '1639432933', '1811154909', '1255727244', '1699830901', '1619354479', '1982839775', '1295050136', '1164826749', '1053387464', '1376005926', '1275976029', '1811977622', '1821251497', '1487656203', '1861711509', '1447437280', '1023002714', '1144531864', '1629465067', '1174557821', '1598183410', '1013909514', '1194837534', '1134372980', '1588716237', '1013901354', '1578041679', '1295838134', '1609806108', '1720160914', '1629337894', '1720356322', '1396004131', '1841525896', '1316120587', '1174646079', '1689898967', '1609836675', '1477230506', 'Hasnotapplied', '1609623198', '1679969877', '1104954080', '1003407826', '1033701255', '1083205819', '1215529433', '1265168504', '1538894001', '1609607605', '1649908534', '1689404568', '1841884855', '1841925088', '1861083677', '1891204509', '1902804032', '1164890554', '1659861359', '1922566744', '1851946131', '1861023137', '1043052319', '1750953477', '1245233378', '1487044194', '1326041443', '1083097976', '1053846113', '1477642569', '1588106405', '1992131692', '1922678812', '1205465895', '1659645232', '1467912089', '1912405978', '1790550804', '1407859549', '1235899386', '1881660470', '1922832740', '1811034184', '1346606183', '1538624432', '1467583450', '1811283567', '1497159834', '1134827652', '1760639082', '1639919038', '1730529520', '1124344080', '1093754491', '1881039857', '1659861276', '1083662423', '1629357892', '1245849637', '1316460934', '1689891491', '1093896730', '1518578855', '1639863533', '1669731410', '1871888545', '1669926887', '1982690095', '1770642860', '1093474744', '1194752246', '1508084005', '1134966906', '1639559511', '1245506518', '1013095603']; 

  // State for TIN queries
  const [tinQueries, setTinQueries] = useState(staticTINs);

  return (
    <ProviderContext.Provider value={{ tinQueries, setTinQueries, staticNPIs }}>
      {children}
    </ProviderContext.Provider>
  );
};

export { ProviderContextProvider };
