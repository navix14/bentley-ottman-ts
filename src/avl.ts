class AVLTreeNode<T> {
  value: T;
  left: AVLTreeNode<T> | null;
  right: AVLTreeNode<T> | null;
  height: number;

  constructor(value: T) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

type Comparator<T> = (a: T, b: T) => number;

class AVLTree<T> {
  root: AVLTreeNode<T> | null;
  private comparator: Comparator<T>;

  constructor(comparator?: Comparator<T> | undefined) {
    this.root = null;
    this.comparator = (a: T, b: T): number => (a as number) - (b as number);

    if (comparator) {
      this.comparator = comparator;
    }
  }

  private getHeight(node: AVLTreeNode<T> | null): number {
    if (node === null) return 0;
    return node.height;
  }

  private updateHeight(node: AVLTreeNode<T> | null): void {
    if (node === null) return;
    node.height =
      Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
  }

  private getBalanceFactor(node: AVLTreeNode<T> | null): number {
    if (node === null) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  private rotateRight(node: AVLTreeNode<T>): AVLTreeNode<T> {
    const newRoot = node.left!;
    node.left = newRoot.right;
    newRoot.right = node;

    this.updateHeight(node);
    this.updateHeight(newRoot);

    return newRoot;
  }

  private rotateLeft(node: AVLTreeNode<T>): AVLTreeNode<T> {
    const newRoot = node.right!;
    node.right = newRoot.left;
    newRoot.left = node;

    this.updateHeight(node);
    this.updateHeight(newRoot);

    return newRoot;
  }

  private rebalance(node: AVLTreeNode<T>): AVLTreeNode<T> {
    this.updateHeight(node);

    const balanceFactor = this.getBalanceFactor(node);

    if (balanceFactor > 1) {
      if (this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left!);
      }
      return this.rotateRight(node);
    }

    if (balanceFactor < -1) {
      if (this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right!);
      }
      return this.rotateLeft(node);
    }

    return node;
  }

  insert(value: T): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: AVLTreeNode<T> | null, value: T): AVLTreeNode<T> {
    if (node === null) {
      return new AVLTreeNode(value);
    }

    if (this.comparator(value, node.value) < 0) {
      node.left = this.insertNode(node.left, value);
    } else if (this.comparator(value, node.value) > 0) {
      node.right = this.insertNode(node.right, value);
    } else {
      return node;
    }

    return this.rebalance(node);
  }

  remove(value: T): void {
    this.root = this.removeNode(this.root, value);
  }

  private findMinNode(node: AVLTreeNode<T>): AVLTreeNode<T> {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  private findMaxNode(node: AVLTreeNode<T>): AVLTreeNode<T> {
    let current = node;
    while (current.right !== null) {
      current = current.right;
    }
    return current;
  }

  private findNode(value: T): AVLTreeNode<T> | null {
    let current = this.root;
    while (current !== null) {
      if (this.comparator(value, current.value) < 0) {
        current = current.left;
      } else if (this.comparator(value, current.value) > 0) {
        current = current.right;
      } else {
        return current;
      }
    }
    return null;
  }

  findSuccessor(value: T): T | null {
    const node = this.findNode(value);
    if (node === null) return null;

    if (node.right !== null) {
      return this.findMinNode(node.right).value;
    }

    let current = this.root;
    let successor: AVLTreeNode<T> | null = null;

    while (current !== null) {
      if (this.comparator(value, current.value) < 0) {
        successor = current;
        current = current.left;
      } else if (this.comparator(value, current.value) > 0) {
        current = current.right;
      } else {
        break;
      }
    }

    return successor !== null ? successor.value : null;
  }

  findPredecessor(value: T): T | null {
    const node = this.findNode(value);
    if (node === null) return null;

    if (node.left !== null) {
      return this.findMaxNode(node.left).value;
    }

    let current = this.root;
    let predecessor: AVLTreeNode<T> | null = null;

    while (current !== null) {
      if (this.comparator(value, current.value) > 0) {
        predecessor = current;
        current = current.right;
      } else if (this.comparator(value, current.value) < 0) {
        current = current.left;
      } else {
        break;
      }
    }

    return predecessor !== null ? predecessor.value : null;
  }

  private removeNode(
    node: AVLTreeNode<T> | null,
    value: T
  ): AVLTreeNode<T> | null {
    if (node === null) return null;

    if (this.comparator(value, node.value) < 0) {
      node.left = this.removeNode(node.left, value);
    } else if (this.comparator(value, node.value) > 0) {
      node.right = this.removeNode(node.right, value);
    } else {
      if (node.left === null && node.right === null) {
        return null; // Node has no children
      } else if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      } else {
        const minNode = this.findMinNode(node.right);
        node.value = minNode.value;
        node.right = this.removeNode(node.right, minNode.value);
      }
    }

    return this.rebalance(node);
  }

  iterator(): AVLTreeIterator<T> {
    return new AVLTreeIterator(this.root);
  }

  inOrderTraversal(): void {
    this.inOrderTraversalHelper(this.root);
  }

  private inOrderTraversalHelper(node: AVLTreeNode<T> | null): void {
    if (node === null) return;
    this.inOrderTraversalHelper(node.left);
    console.log(node.value);
    this.inOrderTraversalHelper(node.right);
  }
}

class AVLTreeIterator<T> {
  private stack: AVLTreeNode<T>[];

  constructor(root: AVLTreeNode<T> | null) {
    this.stack = [];
    this.initializeStack(root);
  }

  private initializeStack(node: AVLTreeNode<T> | null): void {
    while (node !== null) {
      this.stack.push(node);
      node = node.left;
    }
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }

  next(): T | undefined {
    if (!this.hasNext()) {
      return undefined;
    }

    const current = this.stack.pop();
    if (current === undefined) {
      return undefined;
    }

    const value = current.value;

    let node = current.right;
    while (node !== null) {
      this.stack.push(node);
      node = node.left;
    }

    return value;
  }
}

function drawTree<T>(
  node: AVLTreeNode<T> | null,
  prefix = "",
  isLeft = false
): void {
  if (node === null) return;

  const marker = isLeft ? "├─ " : "└─ ";
  console.log(prefix + marker + node.value);

  const childPrefix = prefix + (isLeft ? "│  " : "   ");
  drawTree(node.left, childPrefix, true);
  drawTree(node.right, childPrefix, false);
}

export { AVLTree, drawTree };
