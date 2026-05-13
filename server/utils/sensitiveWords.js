/**
 * 敏感词检测工具
 * 使用Trie树算法实现高效的敏感词过滤
 */

// 敏感词列表（情绪类）
const emotionalSensitiveWords = [
  '自杀', '轻生', '想死', '不想活', '结束生命', '自我了结', '一了百了',
  '抑郁', '焦虑', '绝望', '痛苦', '生无可恋', '心如死灰', '万念俱灰',
  '没人爱', '没人关心', '孤独', '无助', '没有希望', '被遗弃', '无人理解',
  '活着没意思', '活着痛苦', '活不下去', '好累', '撑不住了', '心累', '身心俱疲',
  '我是废物', '我很失败', '我不配', '我很差劲', '毫无价值'
];

const violenceSensitiveWords = [
  '打架', '斗殴', '暴打', '殴打', '伤害', '打死', '揍死', '弄死',
  '杀人', '杀死', '残忍', '暴力', '血腥', '屠杀', '虐待', '折磨',
  '报复', '仇恨', '威胁', '恐吓', '欺凌', '恐吓', '要你命', '弄死你',
  '草泥马', '操你妈', '操你', '操你娘', '操你女', '操你女娘',
  '日你妈', '日你', '日你娘', '日你女', '日你女娘',
  '尼玛', '你大爷', '傻逼', '白痴', '智障', '脑残',
  'cnm', 'nm', 'TMD','你个SB','你个SB娘','你个SB女','你个SB女娘',
  '你个SB男','你个SB男娘','sm','sb','nmlgb',
  '去死', '死吧', '该死', '找死', '活该死'
];

// 敏感词列表（网络暴力类）
const cyberViolenceSensitiveWords = [
  '网暴', '人肉', '人肉搜索', '网络暴力', '网络霸凌', '网络欺凌',
  '键盘侠', '喷子', '黑粉', '水军', '网络流氓', '网络恶霸',
  '网络攻击', '人身攻击', '恶意攻击', '群体攻击', '围攻',
  '造谣', '诽谤', '传谣', '恶意传播', '散布谣言', '污蔑',
  '辱骂', '侮辱', '谩骂', '人格侮辱', '恶意中伤', '言语攻击',
  '隐私曝光', '个人信息泄露', '恶意曝光', '隐私侵犯',
  '网络骚扰', '恶意骚扰', '持续骚扰', '跟踪骚扰','开户',
  '恶意评论', '恶意差评', '刷差评', '恶意刷屏', '恶意举报',
  '法师', '丑'
];

// 构建Trie树
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.word = '';
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEndOfWord = true;
    node.word = word;
  }

  search(text) {
    const result = {
      found: false,
      words: []
    };

    for (let i = 0; i < text.length; i++) {
      let node = this.root;
      let j = i;

      while (j < text.length && node.children.has(text[j])) {
        node = node.children.get(text[j]);
        j++;

        if (node.isEndOfWord) {
          result.found = true;
          result.words.push(node.word);
          break; // 找到一个敏感词就停止当前搜索
        }
      }
    }

    return result;
  }
}

const emotionalTrie = new Trie();
const violenceTrie = new Trie();
const cyberViolenceTrie = new Trie();

emotionalSensitiveWords.forEach(word => emotionalTrie.insert(word));
violenceSensitiveWords.forEach(word => violenceTrie.insert(word));
cyberViolenceSensitiveWords.forEach(word => cyberViolenceTrie.insert(word));

/**
 * 检查文本中是否包含敏感词
 * @param {string} text - 要检查的文本
 * @returns {Object} - 检查结果
 */
function checkSensitiveWords(text) {
  if (!text || typeof text !== 'string') {
    return {
      hasSensitiveWords: false,
      sanitizedMessage: text || '',
      detectedWords: [],
      type: null
    };
  }

  const emotionalResult = emotionalTrie.search(text);
  const violenceResult = violenceTrie.search(text);
  const cyberViolenceResult = cyberViolenceTrie.search(text);
  const hasSensitiveWords = emotionalResult.found || violenceResult.found || cyberViolenceResult.found;
  const detectedWords = [...new Set([...emotionalResult.words, ...violenceResult.words, ...cyberViolenceResult.words])];
  
  let type = null;
  if (emotionalResult.found) type = 'emotional';
  if (violenceResult.found) type = type ? 'mixed' : 'violence';
  if (cyberViolenceResult.found) type = type ? 'mixed' : 'cyberViolence';

  let sanitizedMessage = text;
  detectedWords.forEach(word => {
    sanitizedMessage = sanitizedMessage.replace(new RegExp(word, 'g'), '*'.repeat(word.length));
  });

  return {
    hasSensitiveWords,
    sanitizedMessage,
    detectedWords,
    type
  };
}

/**
 * 添加自定义敏感词
 * @param {string} word - 要添加的敏感词
 * @param {string} type - 敏感词类型 ('emotional', 'violence' 或 'cyberViolence')
 */
function addSensitiveWord(word, type = 'emotional') {
  if (!word || typeof word !== 'string') {
    console.warn('敏感词必须是非空字符串');
    return false;
  }
  
  const existingWords = type === 'emotional' ? emotionalSensitiveWords :
                       type === 'violence' ? violenceSensitiveWords :
                       type === 'cyberViolence' ? cyberViolenceSensitiveWords : [];
  
  if (existingWords.includes(word)) {
    console.warn(`敏感词 "${word}" 已存在于 ${type} 类别中`);
    return false;
  }
  
  if (type === 'emotional') {
    emotionalTrie.insert(word);
    emotionalSensitiveWords.push(word);
  } else if (type === 'violence') {
    violenceTrie.insert(word);
    violenceSensitiveWords.push(word);
  } else if (type === 'cyberViolence') {
    cyberViolenceTrie.insert(word);
    cyberViolenceSensitiveWords.push(word);
  } else {
    console.warn(`不支持的敏感词类型: ${type}`);
    return false;
  }
  
  console.log(`成功添加敏感词 "${word}" 到 ${type} 类别`);
  return true;
}

/**
 * 批量添加敏感词
 * @param {Array} words - 敏感词数组
 * @param {string} type - 敏感词类型
 */
function addSensitiveWords(words, type = 'emotional') {
  if (!Array.isArray(words)) {
    console.warn('敏感词列表必须是数组');
    return false;
  }
  
  let successCount = 0;
  words.forEach(word => {
    if (addSensitiveWord(word, type)) {
      successCount++;
    }
  });
  
  console.log(`批量添加完成，成功添加 ${successCount}/${words.length} 个敏感词到 ${type} 类别`);
  return successCount;
}

function getSensitiveWordsStats() {
  return {
    emotional: emotionalSensitiveWords.length,
    violence: violenceSensitiveWords.length,
    cyberViolence: cyberViolenceSensitiveWords.length,
    total: emotionalSensitiveWords.length + violenceSensitiveWords.length + cyberViolenceSensitiveWords.length
  };
}

module.exports = {
  checkSensitiveWords,
  addSensitiveWord,
  addSensitiveWords,
  getSensitiveWordsStats,
  emotionalSensitiveWords,
  violenceSensitiveWords,
  cyberViolenceSensitiveWords
};