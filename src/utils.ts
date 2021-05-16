
/*
 * ILine 命名规则
 * l=>left r=>right t=>top b=>bottom c=>center w=>width h=>height x=>x轴 y=>y轴
 * 如 ： lw 表示 左边的宽度
 *       cxh 表示 x轴方向中心 Line 的高度
 * */
export interface ILine {
    lw: number;
    lh: number;
    lt: number;
    ll: number;
    rw: number;
    rh: number;
    rt: number;
    rl: number;
    tw: number;
    th: number;
    tl: number;
    tt: number;
    bw: number;
    bh: number;
    bl: number;
    bt: number;
    cl: number;
    ct: number;
    cxh: number;
    cxw: number;
    cyh: number;
    cyw: number;
}

export interface ICompareNode {
    x: number;
    y: number;
    w: number;
    h: number;
}

const basicLine: ILine = {
    lw: 0,
    lh: 0,
    lt: 0,
    ll: 0,
    rw: 0,
    rh: 0,
    rt: 0,
    rl: 0,
    tw: 0,
    th: 0,
    tl: 0,
    tt: 0,
    bw: 0,
    bh: 0,
    bl: 0,
    bt: 0,
    cl: 0,
    ct: 0,
    cxh: 0,
    cxw: 0,
    cyh: 0,
    cyw: 0,
};



//实时检测对比坐标，并吸附
const detection = (
    target: ICompareNode,
    source: Array<ICompareNode>,
    position: { x: number; y: number },
    threshold: number = 5,
): { x: number; y: number; isBlend: boolean } => {
    let isBlend = false;
    let x = position.x,
        y = position.y;

    for (let i = 0; i < source.length; i++) {
        const node = source[i];

        let x1 = node.x;
        let x2 = node.x + node.w;
        let y1 = node.y;
        let y2 = node.y + node.h;

        if (x === x1 || y === y1 || x + target.w === x2 || y + target.h === y2) {
            return { x, y, isBlend: true };
        }

        if (Math.abs(target.x - x1) <= threshold) {
            x = x1;
        } else if (Math.abs(target.x - x2) <= threshold) {
            x = x2;
        } else if (Math.abs(target.x + target.w - x1) <= threshold) {
            x = x1 - target.w;
        } else if (Math.abs(target.x + target.w - x2) <= threshold) {
            x = x2 - target.w;
        }

        if (Math.abs(target.y - y1) <= threshold) {
            y = y1;
        } else if (Math.abs(target.y - y2) <= threshold) {
            y = y2;
        } else if (Math.abs(target.y + target.h - y1) <= threshold) {
            y = y1 - target.h;
        } else if (Math.abs(target.y + target.h - y2) <= threshold) {
            y = y2 - target.h;
        }

        // x轴中心对比
        if (
            Math.abs(target.w / 2 + target.x - (node.w / 2 + node.x)) <= threshold
        ) {
            x = node.w / 2 + node.x - target.w / 2;
        }

        // y轴中心对比
        if (
            Math.abs(target.h / 2 + target.y - (node.h / 2 + node.y)) <= threshold
        ) {
            y = node.h / 2 + node.y - target.h / 2;
        }
    }

    //如果和原来的坐标不等，说明已经执行吸附操作
    if (x !== position.x || y !== position.y) {
        isBlend = true;
    }
    return { x, y, isBlend };
};

const getMaxAxis = (nodes: Array<ICompareNode>, type: 'x' | 'y') => {
    let arr: Array<number> = [];
    nodes.forEach((node) => {
        if (type === 'x') {
            arr.push(node.x);
            arr.push(node.x + node.w);
        } else if (type === 'y') {
            arr.push(node.y);
            arr.push(node.y + node.h);
        }
    });
    let min = [...arr].sort((a, b) => a - b)[0];
    let max = [...arr].sort((a, b) => b - a)[0];
    return max - min;
};

//计算并返回辅助线的位置信息
const getLineInfo = (
    target: ICompareNode,
    source: Array<ICompareNode>,
    threshold: number = 1, 
): ILine => {
    let leftEq: Array<ICompareNode> = [];
    let rightEq: Array<ICompareNode> = [];
    let topEq: Array<ICompareNode> = [];
    let bottomEq: Array<ICompareNode> = [];
    let xCenterEq: Array<ICompareNode> = [];
    let yCenterEq: Array<ICompareNode> = [];

    //初始值
    let lw = 1,
        lt = 0,
        lh = 0;
    let rw = 1,
        rt = 0,
        rh = 0;
    let th = 1,
        tw = 0,
        tl = 0;
    let bh = 1,
        bw = 0,
        bl = 0;
    let cl = 0,
        cxw = 1,
        cxh = 0,
        cyw = 0,
        cyh = 1,
        ct = 0;

    source.forEach((node) => {
        let x1 = node.x;
        let x2 = node.x + node.w;
        let y1 = node.y;
        let y2 = node.y + node.h;

        //和 target 左边对比
        if (
            Math.abs(target.x - x1) <= threshold ||
            Math.abs(target.x - x2) <= threshold
        ) {
            leftEq.push(node);
        }

        //和 target 右边对比
        if (
            Math.abs(target.x + target.w - x1) <= threshold ||
            Math.abs(target.x + target.w - x2) <= threshold
        ) {
            rightEq.push(node);
        }

        //和 target 上边对比
        if (
            Math.abs(target.y - y1) <= threshold ||
            Math.abs(target.y - y2) <= threshold
        ) {
            topEq.push(node);
        }

        //和 target 下边对比
        if (
            Math.abs(target.y + target.h - y1) <= threshold ||
            Math.abs(target.y + target.h - y2) <= threshold
        ) {
            bottomEq.push(node);
        }

        // x轴中心对比
        if (
            Math.abs(target.w / 2 + target.x - (node.w / 2 + node.x)) <= threshold
        ) {
            xCenterEq.push({ ...node, x: node.w / 2 + node.x });
        }

        // y轴中心对比
        if (
            Math.abs(target.h / 2 + target.y - (node.h / 2 + node.y)) <= threshold
        ) {
            yCenterEq.push({ ...node, y: node.h / 2 + node.y });
        }
    });

    if (leftEq.length > 0) {
        //找到最小 y
        let leftMinY = [...leftEq, target].sort((a, b) => a.y - b.y)[0].y;
        lh = getMaxAxis([...leftEq, target], 'y');
        lt = leftMinY > target.y ? lh - target.y : -(target.y - leftMinY);
    }

    if (rightEq.length > 0) {
        let rightMinY = [...rightEq, target].sort((a, b) => a.y - b.y)[0].y;
        rh = getMaxAxis([...rightEq, target], 'y');
        rt = rightMinY > target.y ? rh - target.y : -(target.y - rightMinY);
    }

    if (topEq.length > 0) {
        let topMinX = [...topEq, target].sort((a, b) => a.x - b.x)[0].x;
        tw = getMaxAxis([...topEq, target], 'x');
        tl = topMinX > target.x ? tw - target.x : -(target.x - topMinX);
    }

    if (bottomEq.length > 0) {
        let bottomMinX = [...bottomEq, target].sort((a, b) => a.x - b.x)[0].x;
        bw = getMaxAxis([...bottomEq, target], 'x');
        bl = bottomMinX > target.x ? bw - target.x : -(target.x - bottomMinX);
    }

    if (xCenterEq.length > 0) {
        let leftMinY = [...xCenterEq, target].sort((a, b) => a.y - b.y)[0].y;
        cxh = getMaxAxis([...xCenterEq, target], 'y');
        lt = leftMinY > target.y ? lh - target.y : -(target.y - leftMinY);
        cl = target.w / 2;
    }

    if (yCenterEq.length > 0) {
        let topMinX = [...yCenterEq, target].sort((a, b) => a.x - b.x)[0].x;
        cyw = getMaxAxis([...yCenterEq, target], 'x');
        tl = topMinX > target.x ? lw - target.x : -(target.x - topMinX);
        ct = target.h / 2;
    }

    return {
        ...basicLine,
        lw,
        lh,
        lt,
        rw,
        rh,
        rt,
        th,
        tw,
        tl,
        bh,
        bw,
        bl,
        cl,
        ct,
        cxh,
        cxw,
        cyw,
        cyh,
    };
};

const getPosRelativeParent = (
    el: HTMLElement,
    parentEl?: HTMLElement,
): { x: number; y: number; w: number; h: number } => {
    let parent = parentEl || (el.parentNode as HTMLElement);
    let parentRect = parent.getBoundingClientRect();
    let elRect = el.getBoundingClientRect();

    return {
        x: Math.floor(elRect.x - parentRect.x),
        y: Math.floor(elRect.y - parentRect.y),
        w: elRect.width,
        h: elRect.height,
    };
}

export {
    basicLine,
    detection,
    getMaxAxis,
    getLineInfo,
    getPosRelativeParent,
}