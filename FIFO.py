from queue import Queue


def pageFaults(pages, n, capacity):
    s = set()
    indexes = Queue()
    page_faults = 0
    for i in range(n):
        if (len(s) < capacity):
            if (pages[i] not in s):
                s.add(pages[i])
                page_faults += 1
                indexes.put(pages[i])
        else:
            if (pages[i] not in s):
                val = indexes.queue[0]
                indexes.get()
                s.remove(val)
                s.add(pages[i])
                indexes.put(pages[i])
                page_faults += 1
    return page_faults

if __name__ == '__main__':
    pages=list(map(int,input("Enter pages with space").split(" ")));
    n = len(pages)
    capacity = 4
    print("No.of Page Fault are:", pageFaults(pages, n, capacity))
