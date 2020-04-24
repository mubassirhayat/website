const fs = require('fs-extra')
const csv = require('csv-parser')
const checkFile = require('../../../utitlities/check-file')

describe('File : States : Current', () => {
  it('exists', () => {
    checkFile('_data/v1/states/current')
  })

  it('matches field pattern', done => {
    fs.createReadStream('_data/v1/states/current.csv')
      .pipe(csv())
      .on('data', row => {
        expect(row).toEqual(
          expect.objectContaining({
            state: expect.anything(),
            positive: expect.anything(),
            positiveScore: expect.anything(),
            negativeScore: expect.anything(),
            negativeRegularScore: expect.anything(),
            commercialScore: expect.anything(),
            grade: expect.anything(),
            score: expect.anything(),
            negative: expect.anything(),
            pending: expect.anything(),
            hospitalizedCurrently: expect.anything(),
            hospitalizedCumulative: expect.anything(),
            inIcuCurrently: expect.anything(),
            inIcuCumulative: expect.anything(),
            onVentilatorCurrently: expect.anything(),
            onVentilatorCumulative: expect.anything(),
            recovered: expect.anything(),
            lastUpdateEt: expect.anything(),
            checkTimeEt: expect.anything(),
            death: expect.anything(),
            hospitalized: expect.anything(),
            total: expect.anything(),
            totalTestResults: expect.anything(),
            posNeg: expect.anything(),
            fips: expect.anything(),
            dateModified: expect.anything(),
            dateChecked: expect.anything(),
            notes: expect.anything(),
            hash: expect.anything(),
          }),
        )
      })
      .on('end', () => {
        done()
      })
  })
})