#!/usr/bin/env babel-node
import fs from 'fs'
import path from 'path'

const FILENAME = path.resolve(process.argv[2] || 'README.md')

let componentDocs = ''
process.stdin.setEncoding('utf8')
process.stdin.on('readable', () => {
  var chunk = process.stdin.read()
  if (chunk !== null) {
    componentDocs += chunk
  }
})

process.stdin.on('end', () => {
  updateReadme(componentDocs)
})

const START_TAG = '<!-- START component-docs -->'
const END_TAG = '<!-- END component-docs -->'

function updateReadme () {
  const oldContent = fs.readFileSync(FILENAME, 'utf8')
  const startIndex = oldContent.indexOf(START_TAG)
  const endIndex = oldContent.indexOf(END_TAG)
  if (startIndex === -1) {
    return oldContent
  }
  const head = oldContent.slice(0, startIndex + START_TAG.length)
  const tail = endIndex === -1 ? END_TAG : oldContent.slice(endIndex)
  const newContent = `${head}\n${componentDocs}\n${tail}`
  fs.writeFileSync(FILENAME, newContent)
}
